import { Router, type IRouter } from "express";
import { db, adminsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { AdminLoginBody } from "@workspace/api-zod";
import { hashPassword, verifyPassword, signToken } from "../lib/auth.js";
import { requireAdmin, type AuthenticatedRequest } from "../middlewares/requireAdmin.js";
import { logger } from "../lib/logger.js";
import nodemailer from "nodemailer";

const router: IRouter = Router();

// ---------------------------------------------------------------------------
// In-memory OTP store
// ---------------------------------------------------------------------------
interface OtpEntry { otp: string; expiresAt: number; }
const otpStore = new Map<string, OtpEntry>();

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function createTransporter() {
  const user = process.env["GMAIL_USER"];
  const pass = process.env["GMAIL_APP_PASSWORD"];
  if (!user || !pass) return null;
  return nodemailer.createTransport({ service: "gmail", auth: { user, pass } });
}

// ---------------------------------------------------------------------------
// POST /auth/login
// ---------------------------------------------------------------------------
router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { username, password } = parsed.data;
  const [admin] = await db.select().from(adminsTable).where(eq(adminsTable.username, username));
  if (!admin || !verifyPassword(password, admin.passwordHash)) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const token = signToken({ id: admin.id, username: admin.username });
  res.json({ token, admin: { id: admin.id, username: admin.username } });
});

// ---------------------------------------------------------------------------
// GET /auth/me
// ---------------------------------------------------------------------------
router.get("/auth/me", requireAdmin, async (req: AuthenticatedRequest, res): Promise<void> => {
  res.json({ id: req.adminId, username: req.adminUsername });
});

// ---------------------------------------------------------------------------
// POST /auth/register  — create new admin (requires SESSION_SECRET as adminKey)
// ---------------------------------------------------------------------------
router.post("/auth/register", async (req, res): Promise<void> => {
  const { username, password, confirmPassword, adminKey } = req.body ?? {};

  if (!username || !password || !confirmPassword || !adminKey) {
    res.status(400).json({ error: "All fields are required" });
    return;
  }
  if (typeof username !== "string" || username.trim().length < 3) {
    res.status(400).json({ error: "Username must be at least 3 characters" });
    return;
  }
  if (typeof password !== "string" || password.length < 6) {
    res.status(400).json({ error: "Password must be at least 6 characters" });
    return;
  }
  if (password !== confirmPassword) {
    res.status(400).json({ error: "Passwords do not match" });
    return;
  }

  const SESSION_SECRET = process.env["SESSION_SECRET"] ?? "";
  if (!SESSION_SECRET || adminKey !== SESSION_SECRET) {
    res.status(403).json({ error: "Invalid Admin Secret Key" });
    return;
  }

  const [existing] = await db.select().from(adminsTable).where(eq(adminsTable.username, username.trim()));
  if (existing) {
    res.status(409).json({ error: "Username already taken" });
    return;
  }

  const [admin] = await db.insert(adminsTable).values({
    username: username.trim(),
    passwordHash: hashPassword(password),
  }).returning();

  logger.info({ username: admin.username }, "New admin account created");
  res.status(201).json({ message: "Account created successfully", username: admin.username });
});

// ---------------------------------------------------------------------------
// POST /auth/forgot-password
// ---------------------------------------------------------------------------
router.post("/auth/forgot-password", async (req, res): Promise<void> => {
  const { username } = req.body ?? {};
  if (!username || typeof username !== "string") {
    res.status(400).json({ error: "Username is required" });
    return;
  }
  const [admin] = await db.select().from(adminsTable).where(eq(adminsTable.username, username.trim()));
  if (!admin) {
    res.json({ message: "If that username exists, an OTP has been sent." });
    return;
  }
  const otp = generateOtp();
  otpStore.set(username.trim(), { otp, expiresAt: Date.now() + 10 * 60 * 1000 });
  const gmailUser = process.env["GMAIL_USER"];
  const transporter = createTransporter();
  if (transporter && gmailUser) {
    try {
      await transporter.sendMail({
        from: `"BOMIS Admin" <${gmailUser}>`,
        to: gmailUser,
        subject: `[BOMIS] Admin Password Reset OTP`,
        html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
          <div style="background:#F15A29;padding:24px 32px;"><h1 style="margin:0;color:#fff;font-size:20px;">Password Reset OTP</h1></div>
          <div style="padding:32px;">
            <p style="color:#333;">A password reset was requested for admin <strong>${username}</strong>.</p>
            <div style="text-align:center;margin:28px 0;"><span style="font-size:40px;font-weight:800;letter-spacing:10px;color:#F15A29;">${otp}</span></div>
            <p style="color:#888;font-size:13px;">Valid for <strong>10 minutes</strong>.</p>
          </div></div>`,
      });
    } catch (err) {
      logger.error({ err }, "Failed to send OTP email");
    }
  } else {
    logger.warn({ otp, username }, "Email not configured — OTP logged for dev use");
  }
  res.json({ message: "If that username exists, an OTP has been sent." });
});

// ---------------------------------------------------------------------------
// POST /auth/reset-password
// ---------------------------------------------------------------------------
router.post("/auth/reset-password", async (req, res): Promise<void> => {
  const { username, otp, newPassword } = req.body ?? {};
  if (!username || !otp || !newPassword) {
    res.status(400).json({ error: "username, otp and newPassword are required" });
    return;
  }
  if (typeof newPassword !== "string" || newPassword.length < 6) {
    res.status(400).json({ error: "Password must be at least 6 characters" });
    return;
  }
  const entry = otpStore.get(username.trim());
  if (!entry) { res.status(400).json({ error: "No OTP found. Please request a new one." }); return; }
  if (Date.now() > entry.expiresAt) {
    otpStore.delete(username.trim());
    res.status(400).json({ error: "OTP has expired. Please request a new one." });
    return;
  }
  if (entry.otp !== otp.trim()) { res.status(400).json({ error: "Invalid OTP." }); return; }
  const [admin] = await db.select().from(adminsTable).where(eq(adminsTable.username, username.trim()));
  if (!admin) { res.status(404).json({ error: "User not found" }); return; }
  await db.update(adminsTable).set({ passwordHash: hashPassword(newPassword) }).where(eq(adminsTable.id, admin.id));
  otpStore.delete(username.trim());
  res.json({ message: "Password reset successfully." });
});

// ---------------------------------------------------------------------------
// Seed default admin
// ---------------------------------------------------------------------------
export async function ensureDefaultAdmin(): Promise<void> {
  const existing = await db.select().from(adminsTable);
  if (existing.length === 0) {
    await db.insert(adminsTable).values({
      username: "admin",
      passwordHash: hashPassword("birla@admin2024"),
    });
  }
}

export default router;

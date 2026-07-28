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
// In-memory OTP store  { username -> { otp, expiresAt } }
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
// POST /auth/forgot-password  — generate & email OTP
// ---------------------------------------------------------------------------
router.post("/auth/forgot-password", async (req, res): Promise<void> => {
  const { username } = req.body ?? {};
  if (!username || typeof username !== "string") {
    res.status(400).json({ error: "Username is required" });
    return;
  }

  const [admin] = await db.select().from(adminsTable).where(eq(adminsTable.username, username.trim()));
  if (!admin) {
    // Return success anyway to avoid username enumeration
    res.json({ message: "If that username exists, an OTP has been sent." });
    return;
  }

  const otp = generateOtp();
  otpStore.set(username.trim(), { otp, expiresAt: Date.now() + 10 * 60 * 1000 }); // 10 min

  const gmailUser = process.env["GMAIL_USER"];
  const transporter = createTransporter();

  if (transporter && gmailUser) {
    try {
      await transporter.sendMail({
        from: `"BOMIS Admin" <${gmailUser}>`,
        to: gmailUser,
        subject: `[BOMIS] Admin Password Reset OTP`,
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
            <div style="background:#F15A29;padding:24px 32px;">
              <h1 style="margin:0;color:#fff;font-size:20px;">Password Reset OTP</h1>
              <p style="margin:4px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">BOMIS Rajound — Admin Portal</p>
            </div>
            <div style="padding:32px;">
              <p style="color:#333;font-size:15px;">A password reset was requested for admin account <strong>${username}</strong>.</p>
              <div style="text-align:center;margin:28px 0;">
                <span style="font-size:40px;font-weight:800;letter-spacing:10px;color:#F15A29;">${otp}</span>
              </div>
              <p style="color:#888;font-size:13px;">This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone.</p>
            </div>
          </div>`,
      });
      logger.info({ username }, "Password reset OTP sent");
    } catch (err) {
      logger.error({ err }, "Failed to send OTP email");
    }
  } else {
    // Dev fallback — log OTP so developer can see it
    logger.warn({ otp, username }, "Email not configured — OTP logged for dev use");
  }

  res.json({ message: "If that username exists, an OTP has been sent." });
});

// ---------------------------------------------------------------------------
// POST /auth/reset-password  — verify OTP & set new password
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
  if (!entry) {
    res.status(400).json({ error: "No OTP found. Please request a new one." });
    return;
  }

  if (Date.now() > entry.expiresAt) {
    otpStore.delete(username.trim());
    res.status(400).json({ error: "OTP has expired. Please request a new one." });
    return;
  }

  if (entry.otp !== otp.trim()) {
    res.status(400).json({ error: "Invalid OTP. Please check and try again." });
    return;
  }

  // OTP valid — update password
  const [admin] = await db.select().from(adminsTable).where(eq(adminsTable.username, username.trim()));
  if (!admin) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  await db.update(adminsTable)
    .set({ passwordHash: hashPassword(newPassword) })
    .where(eq(adminsTable.id, admin.id));

  otpStore.delete(username.trim());
  logger.info({ username }, "Admin password reset successfully");

  res.json({ message: "Password reset successfully. You can now log in." });
});

// ---------------------------------------------------------------------------
// Seed default admin if not exists (called on startup)
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

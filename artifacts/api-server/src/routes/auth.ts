import { randomInt, randomBytes } from "crypto";
import { Router, type IRouter } from "express";
import { db, adminsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { AdminLoginBody } from "@workspace/api-zod";
import { hashPassword, verifyPassword, signToken } from "../lib/auth.js";
import { requireAdmin, type AuthenticatedRequest } from "../middlewares/requireAdmin.js";
import { logger } from "../lib/logger.js";
import nodemailer from "nodemailer";
import { authRateLimit } from "../middlewares/rateLimits.js";

const router: IRouter = Router();

// ---------------------------------------------------------------------------
// In-memory OTP store
// ---------------------------------------------------------------------------
interface OtpEntry { otp: string; expiresAt: number; attempts: number; }
const otpStore = new Map<string, OtpEntry>();

/** Cryptographically secure 6-digit OTP */
function generateOtp(): string {
  return randomInt(100000, 1000000).toString();
}

function createTransporter() {
  const user = process.env["GMAIL_USER"];
  const pass = process.env["GMAIL_APP_PASSWORD"];
  if (!user || !pass) return null;
  return nodemailer.createTransport({ service: "gmail", auth: { user, pass } });
}

function gmailUser() { return process.env["GMAIL_USER"] ?? ""; }

// ---------------------------------------------------------------------------
// POST /auth/login
// ---------------------------------------------------------------------------
router.post("/auth/login", authRateLimit, async (req, res): Promise<void> => {
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
router.post("/auth/register", authRateLimit, async (req, res): Promise<void> => {
  const { username, password, confirmPassword, adminKey, email } = req.body ?? {};

  if (!username || !password || !confirmPassword || !adminKey || !email) {
    res.status(400).json({ error: "All fields are required" });
    return;
  }
  if (typeof username !== "string" || username.trim().length < 3) {
    res.status(400).json({ error: "Username must be at least 3 characters" });
    return;
  }
  if (typeof password !== "string" || password.length < 8) {
    res.status(400).json({ error: "Password must be at least 8 characters" });
    return;
  }
  if (password !== confirmPassword) {
    res.status(400).json({ error: "Passwords do not match" });
    return;
  }

  // Basic email format check
  if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    res.status(400).json({ error: "Enter a valid email address" });
    return;
  }

  const SESSION_SECRET = process.env["SESSION_SECRET"] ?? "";
  if (!SESSION_SECRET || adminKey !== SESSION_SECRET) {
    res.status(403).json({ error: "Invalid Admin Secret Key" });
    return;
  }

  const [existingUsername] = await db.select().from(adminsTable).where(eq(adminsTable.username, username.trim()));
  if (existingUsername) {
    res.status(409).json({ error: "Username already taken" });
    return;
  }

  const [existingEmail] = await db.select().from(adminsTable).where(eq(adminsTable.email, email.trim().toLowerCase()));
  if (existingEmail) {
    res.status(409).json({ error: "This email is already registered" });
    return;
  }

  const [admin] = await db.insert(adminsTable).values({
    username: username.trim(),
    passwordHash: hashPassword(password),
    email: email.trim().toLowerCase(),
  }).returning();

  logger.info({ username: admin.username, email: admin.email }, "New admin account created");
  res.status(201).json({ message: "Account created successfully", username: admin.username });
});

// ---------------------------------------------------------------------------
// POST /auth/forgot-password  — send OTP to admin's registered email
// ---------------------------------------------------------------------------
router.post("/auth/forgot-password", authRateLimit, async (req, res): Promise<void> => {
  const { username } = req.body ?? {};
  if (!username || typeof username !== "string") {
    res.status(400).json({ error: "Username is required" });
    return;
  }

  const [admin] = await db.select().from(adminsTable).where(eq(adminsTable.username, username.trim()));

  // Always respond the same to prevent username enumeration
  if (!admin || !admin.email) {
    res.json({ message: "If that username exists, an OTP has been sent to the registered email." });
    return;
  }

  const otp = generateOtp();
  otpStore.set(username.trim(), { otp, expiresAt: Date.now() + 10 * 60 * 1000, attempts: 0 });

  const transporter = createTransporter();
  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"BOMIS Admin Portal" <${gmailUser()}>`,
        to: admin.email,
        subject: `[BOMIS] Password Reset OTP`,
        html: `
<div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
  <div style="background:#8B1E2D;padding:24px 32px;">
    <h1 style="margin:0;color:#fff;font-size:20px;">Password Reset OTP</h1>
    <p style="margin:6px 0 0;color:#f8c8c8;font-size:13px;">Birla Open Minds International School</p>
  </div>
  <div style="padding:32px;">
    <p style="color:#333;margin:0 0 16px;">Hi <strong>${admin.username}</strong>,</p>
    <p style="color:#555;margin:0 0 24px;">We received a request to reset your admin portal password. Use the OTP below to continue:</p>
    <div style="text-align:center;margin:28px 0;background:#fff5f0;border:2px dashed #F15A29;border-radius:10px;padding:24px 0;">
      <span style="font-size:42px;font-weight:800;letter-spacing:12px;color:#F15A29;font-family:monospace;">${otp}</span>
    </div>
    <p style="color:#888;font-size:13px;text-align:center;">Valid for <strong>10 minutes</strong>. Do not share this OTP with anyone.</p>
    <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
    <p style="color:#bbb;font-size:12px;text-align:center;">If you did not request this, you can safely ignore this email.</p>
  </div>
</div>`,
      });
      logger.info({ username: admin.username }, "OTP email sent");
    } catch (err) {
      logger.error({ err }, "Failed to send OTP email");
    }
  } else {
    // Email not configured — OTP is not delivered. Do NOT log it.
    logger.warn({ username }, "Email not configured — OTP could not be delivered. Configure GMAIL_USER and GMAIL_APP_PASSWORD.");
  }

  res.json({ message: "If that username exists, an OTP has been sent to the registered email." });
});

// ---------------------------------------------------------------------------
// POST /auth/reset-password
// ---------------------------------------------------------------------------
router.post("/auth/reset-password", authRateLimit, async (req, res): Promise<void> => {
  const { username, otp, newPassword } = req.body ?? {};
  if (!username || !otp || !newPassword) {
    res.status(400).json({ error: "username, otp and newPassword are required" });
    return;
  }
  if (typeof newPassword !== "string" || newPassword.length < 8) {
    res.status(400).json({ error: "Password must be at least 8 characters" });
    return;
  }
  const entry = otpStore.get(username.trim());
  if (!entry) { res.status(400).json({ error: "No OTP found. Please request a new one." }); return; }
  if (Date.now() > entry.expiresAt) {
    otpStore.delete(username.trim());
    res.status(400).json({ error: "OTP has expired. Please request a new one." });
    return;
  }

  // Limit OTP guessing attempts per request window
  entry.attempts += 1;
  if (entry.attempts > 5) {
    otpStore.delete(username.trim());
    res.status(429).json({ error: "Too many incorrect attempts. Please request a new OTP." });
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
// Seed default admin on first boot.
// If ADMIN_PASSWORD env var is set, it is used as the admin password and
// kept in sync on every restart — so changing the env var updates the login.
// If not set and no admin exists yet, a random password is generated once
// and printed to the server logs.
// ---------------------------------------------------------------------------
export async function ensureDefaultAdmin(): Promise<void> {
  const envPassword = process.env["ADMIN_PASSWORD"];
  const existing = await db.select().from(adminsTable);

  if (existing.length === 0) {
    // First boot — create the default admin
    const password = envPassword ?? randomBytes(12).toString("base64url");
    await db.insert(adminsTable).values({
      username: "admin",
      passwordHash: hashPassword(password),
    });
    if (envPassword) {
      logger.info({ username: "admin" }, "✅ Default admin created using ADMIN_PASSWORD env var.");
    } else {
      logger.warn(
        { username: "admin", temporaryPassword: password },
        "⚠️  Default admin seeded with a random temporary password. " +
        "Set ADMIN_PASSWORD env var to lock in a stable password, or log in and change it now.",
      );
    }
  } else if (envPassword) {
    // Admin exists — keep password in sync with ADMIN_PASSWORD env var
    const [admin] = existing.filter(a => a.username === "admin");
    if (admin) {
      await db.update(adminsTable)
        .set({ passwordHash: hashPassword(envPassword) })
        .where(eq(adminsTable.id, admin.id));
      logger.info({ username: "admin" }, "✅ Admin password synced from ADMIN_PASSWORD env var.");
    }
  }
}

export default router;

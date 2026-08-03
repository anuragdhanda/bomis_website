import { randomInt, randomBytes } from "crypto";
import { Router, type IRouter, type Request } from "express";
import { db, adminsTable, adminOtpTokensTable } from "@workspace/db";
import { eq, and, gt, isNull, desc } from "drizzle-orm";
import { AdminLoginBody } from "@workspace/api-zod";
import { hashPassword, verifyPassword, signToken } from "../lib/auth.js";
import { requireAdmin, type AuthenticatedRequest } from "../middlewares/requireAdmin.js";
import { logger } from "../lib/logger.js";
import nodemailer from "nodemailer";
import { authRateLimit, otpEmailRateLimit } from "../middlewares/rateLimits.js";

const router: IRouter = Router();

// ---------------------------------------------------------------------------
// Email helpers
// ---------------------------------------------------------------------------
function createTransporter() {
  const user = process.env["GMAIL_USER"];
  const pass = process.env["GMAIL_APP_PASSWORD"];
  if (!user || !pass) return null;
  return nodemailer.createTransport({ service: "gmail", auth: { user, pass } });
}

function gmailUser() { return process.env["GMAIL_USER"] ?? ""; }

function otpEmailHtml(otp: string) {
  return `
<div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
  <div style="background:#1e3a5f;padding:24px 32px;text-align:center;">
    <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;">Bright Open Minds</h1>
    <p style="margin:4px 0 0;color:#b8d0f0;font-size:13px;">International School — Admin Portal</p>
  </div>
  <div style="padding:32px;">
    <p style="color:#333;margin:0 0 8px;font-size:15px;">Your one-time login code:</p>
    <div style="text-align:center;margin:24px 0;background:#f0f7ff;border:2px dashed #1e3a5f;border-radius:10px;padding:24px 0;">
      <span style="font-size:44px;font-weight:800;letter-spacing:14px;color:#1e3a5f;font-family:monospace;">${otp}</span>
    </div>
    <p style="color:#666;font-size:13px;text-align:center;margin:0 0 8px;">
      ⏱ Valid for <strong>5 minutes</strong>. Single use only.
    </p>
    <p style="color:#999;font-size:12px;text-align:center;margin:0;">
      If you didn't request this, you can safely ignore this email.
    </p>
  </div>
</div>`;
}

// ---------------------------------------------------------------------------
// POST /auth/send-otp  — step 1 of email OTP login
// ---------------------------------------------------------------------------
router.post("/auth/send-otp", otpEmailRateLimit, async (req: Request, res): Promise<void> => {
  const email = req.body?.email;
  if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    res.status(400).json({ error: "A valid email address is required." });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Anti-enumeration: always same response
  const sendSameResponse = () =>
    res.json({ message: "If this email is registered, an OTP has been sent." });

  // Find admin by email
  const [admin] = await db.select().from(adminsTable).where(eq(adminsTable.email, normalizedEmail));

  // Rate-limit per email: max 3 OTP requests per 15 minutes
  if (admin) {
    const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000);
    const recentOtps = await db
      .select({ id: adminOtpTokensTable.id })
      .from(adminOtpTokensTable)
      .where(
        and(
          eq(adminOtpTokensTable.email, normalizedEmail),
          gt(adminOtpTokensTable.createdAt, fifteenMinAgo),
        ),
      );
    if (recentOtps.length >= 3) {
      res.status(429).json({ error: "Too many OTP requests. Please wait 15 minutes and try again." });
      return;
    }
  }

  sendSameResponse();

  if (!admin) return; // don't reveal non-existence

  // Generate, hash, and store OTP
  const otp = randomInt(100000, 1000000).toString().padStart(6, "0");
  const otpHash = hashPassword(otp);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  const ipAddress = (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0]?.trim() ?? req.socket.remoteAddress ?? "unknown";

  await db.insert(adminOtpTokensTable).values({ email: normalizedEmail, otpHash, expiresAt, ipAddress });

  // Send email
  const transporter = createTransporter();
  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"Bright Open Minds Admin" <${gmailUser()}>`,
        to: admin.email!,
        subject: `Your Admin Login OTP — ${otp}`,
        html: otpEmailHtml(otp),
      });
      logger.info({ email: normalizedEmail }, "OTP email sent");
    } catch (err) {
      logger.error({ err }, "Failed to send OTP email");
    }
  } else {
    // Dev fallback: print OTP to server logs only
    logger.warn({ email: normalizedEmail, otp }, "📧 Email not configured — OTP printed here (dev only). Set GMAIL_USER + GMAIL_APP_PASSWORD.");
  }
});

// ---------------------------------------------------------------------------
// POST /auth/verify-otp  — step 2 of email OTP login
// ---------------------------------------------------------------------------
router.post("/auth/verify-otp", authRateLimit, async (req: Request, res): Promise<void> => {
  const { email, otp } = req.body ?? {};

  if (!email || !otp || typeof email !== "string" || typeof otp !== "string") {
    res.status(400).json({ error: "Email and OTP are required." });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();

  const [admin] = await db.select().from(adminsTable).where(eq(adminsTable.email, normalizedEmail));
  if (!admin) {
    res.status(401).json({ error: "Invalid OTP or email." });
    return;
  }

  // Find the most recent unused, non-expired OTP
  const [otpRecord] = await db
    .select()
    .from(adminOtpTokensTable)
    .where(
      and(
        eq(adminOtpTokensTable.email, normalizedEmail),
        isNull(adminOtpTokensTable.usedAt),
        gt(adminOtpTokensTable.expiresAt, new Date()),
      ),
    )
    .orderBy(desc(adminOtpTokensTable.createdAt))
    .limit(1);

  if (!otpRecord) {
    res.status(401).json({ error: "OTP has expired or was not found. Please request a new one." });
    return;
  }

  // Check lock
  if (otpRecord.lockedUntil && new Date() < otpRecord.lockedUntil) {
    res.status(429).json({ error: "Too many failed attempts. Please request a new OTP." });
    return;
  }

  // Check max attempts
  if (otpRecord.attempts >= 5) {
    const lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
    await db.update(adminOtpTokensTable).set({ lockedUntil }).where(eq(adminOtpTokensTable.id, otpRecord.id));
    res.status(429).json({ error: "Too many failed attempts. Please request a new OTP." });
    return;
  }

  // Verify OTP
  if (!verifyPassword(otp.trim(), otpRecord.otpHash)) {
    await db
      .update(adminOtpTokensTable)
      .set({ attempts: otpRecord.attempts + 1 })
      .where(eq(adminOtpTokensTable.id, otpRecord.id));
    const remaining = 5 - (otpRecord.attempts + 1);
    res.status(401).json({ error: `Invalid OTP. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.` });
    return;
  }

  // Mark OTP as used
  await db
    .update(adminOtpTokensTable)
    .set({ usedAt: new Date() })
    .where(eq(adminOtpTokensTable.id, otpRecord.id));

  // Issue JWT
  const token = signToken({ id: admin.id, username: admin.username });
  const ipAddress = (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0]?.trim() ?? req.socket.remoteAddress ?? "unknown";
  logger.info({ email: normalizedEmail, username: admin.username, ip: ipAddress }, "✅ Admin logged in via OTP");

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
// Password is not needed — login is via email OTP.
// ---------------------------------------------------------------------------
router.post("/auth/register", authRateLimit, async (req, res): Promise<void> => {
  const { username, email, adminKey } = req.body ?? {};

  if (!username || !email || !adminKey) {
    res.status(400).json({ error: "Username, email, and admin key are required." });
    return;
  }
  if (typeof username !== "string" || username.trim().length < 3) {
    res.status(400).json({ error: "Username must be at least 3 characters." });
    return;
  }
  if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    res.status(400).json({ error: "Enter a valid email address." });
    return;
  }

  const SESSION_SECRET = process.env["SESSION_SECRET"] ?? "";
  if (!SESSION_SECRET || adminKey !== SESSION_SECRET) {
    res.status(403).json({ error: "Invalid Admin Secret Key." });
    return;
  }

  const [existingUsername] = await db.select().from(adminsTable).where(eq(adminsTable.username, username.trim()));
  if (existingUsername) {
    res.status(409).json({ error: "Username already taken." });
    return;
  }

  const [existingEmail] = await db.select().from(adminsTable).where(eq(adminsTable.email, email.trim().toLowerCase()));
  if (existingEmail) {
    res.status(409).json({ error: "This email is already registered." });
    return;
  }

  // Generate a random internal password hash (user logs in via OTP, not password)
  const randomPwHash = hashPassword(randomBytes(24).toString("base64url"));

  const [admin] = await db.insert(adminsTable).values({
    username: username.trim(),
    passwordHash: randomPwHash,
    email: email.trim().toLowerCase(),
  }).returning();

  logger.info({ username: admin.username, email: admin.email }, "New admin account created");
  res.status(201).json({ message: "Account created successfully.", username: admin.username });
});

// ---------------------------------------------------------------------------
// Seed default admin on first boot.
// If ADMIN_EMAIL env var is set, it is attached to the default admin account
// so they can log in via email OTP immediately.
// ---------------------------------------------------------------------------
export async function ensureDefaultAdmin(): Promise<void> {
  const envPassword = process.env["ADMIN_PASSWORD"];
  const envEmail    = process.env["ADMIN_EMAIL"];
  const existing    = await db.select().from(adminsTable);

  if (existing.length === 0) {
    const password = envPassword ?? randomBytes(12).toString("base64url");
    await db.insert(adminsTable).values({
      username: "admin",
      passwordHash: hashPassword(password),
      email: envEmail?.trim().toLowerCase() ?? null,
    });
    if (envEmail) {
      logger.info({ username: "admin", email: envEmail }, "✅ Default admin created. Login via email OTP.");
    } else {
      logger.warn(
        { username: "admin" },
        "⚠️  Default admin created without email. Set ADMIN_EMAIL env var so they can log in via OTP, or use Create Account on the login page.",
      );
    }
  } else {
    // Sync ADMIN_PASSWORD if set
    if (envPassword) {
      const [admin] = existing.filter(a => a.username === "admin");
      if (admin) {
        await db.update(adminsTable)
          .set({ passwordHash: hashPassword(envPassword) })
          .where(eq(adminsTable.id, admin.id));
        logger.info({ username: "admin" }, "✅ Admin password synced from ADMIN_PASSWORD env var.");
      }
    }
    // Sync ADMIN_EMAIL if set and admin has no email
    if (envEmail) {
      const [admin] = existing.filter(a => a.username === "admin" && !a.email);
      if (admin) {
        await db.update(adminsTable)
          .set({ email: envEmail.trim().toLowerCase() })
          .where(eq(adminsTable.id, admin.id));
        logger.info({ username: "admin", email: envEmail }, "✅ Admin email synced from ADMIN_EMAIL env var.");
      }
    }
  }
}

export default router;

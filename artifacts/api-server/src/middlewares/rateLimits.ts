import { rateLimit } from "express-rate-limit";

/**
 * Strict rate limiter for auth endpoints (login, verify-otp, register).
 * 10 requests per IP per 15-minute window (failed only).
 */
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many authentication attempts, please try again in 15 minutes." },
  skipSuccessfulRequests: true,
});

/**
 * Rate limiter for send-otp endpoint.
 * Max 5 OTP send requests per IP per 15 minutes.
 */
export const otpEmailRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many OTP requests from this IP. Please wait 15 minutes." },
  keyGenerator: (req) =>
    (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0]?.trim() ??
    req.socket.remoteAddress ??
    "unknown",
});

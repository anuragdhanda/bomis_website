import { rateLimit } from "express-rate-limit";

/**
 * Strict rate limiter for authentication endpoints (login, register, OTP).
 * 10 failed requests per IP per 15-minute window.
 */
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many authentication attempts, please try again in 15 minutes." },
  skipSuccessfulRequests: true,
});

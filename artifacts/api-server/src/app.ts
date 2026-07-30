import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { ensureDefaultAdmin } from "./routes/auth.js";

const app: Express = express();

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet());

// ── Request logging ───────────────────────────────────────────────────────────
app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

// ── CORS ──────────────────────────────────────────────────────────────────────
// In production both frontend and API share the same domain (path-routed),
// so no cross-origin requests are needed. In local dev the Vite dev server
// runs on a different port, so we allow localhost origins there.
const allowedOrigins = (() => {
  const envOrigin = process.env.ALLOWED_ORIGIN;
  if (envOrigin) return envOrigin.split(",").map((o) => o.trim());
  if (process.env.NODE_ENV !== "production") {
    return [/^https?:\/\/localhost(:\d+)?$/, /\.replit\.dev$/];
  }
  return false; // same-origin only in production
})();

app.use(
  cors({
    origin: allowedOrigins as cors.CorsOptions["origin"],
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json({ limit: "50kb" }));
app.use(express.urlencoded({ extended: true, limit: "50kb" }));

// ── Global rate limiter (broad protection) ────────────────────────────────────
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests, please try again later." },
  }),
);

app.use("/api", router);

// Seed default admin on startup
ensureDefaultAdmin().catch((err) => logger.error({ err }, "Failed to seed default admin"));

export default app;

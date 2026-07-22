import { Router, type IRouter } from "express";
import { db, adminsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { AdminLoginBody } from "@workspace/api-zod";
import { hashPassword, verifyPassword, signToken } from "../lib/auth.js";
import { requireAdmin, type AuthenticatedRequest } from "../middlewares/requireAdmin.js";

const router: IRouter = Router();

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

router.get("/auth/me", requireAdmin, async (req: AuthenticatedRequest, res): Promise<void> => {
  res.json({ id: req.adminId, username: req.adminUsername });
});

// Seed default admin if not exists (called on startup)
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

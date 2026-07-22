import { Router, type IRouter } from "express";
import { db, facultyTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import {
  CreateFacultyMemberBody,
  UpdateFacultyMemberBody,
  UpdateFacultyMemberParams,
  DeleteFacultyMemberParams,
} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/requireAdmin.js";

const router: IRouter = Router();

router.get("/faculty", async (_req, res): Promise<void> => {
  const results = await db.select().from(facultyTable).orderBy(asc(facultyTable.sortOrder), asc(facultyTable.id));
  res.json(results.map(row => ({ ...row, createdAt: row.createdAt.toISOString() })));
});

router.post("/faculty", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateFacultyMemberBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [item] = await db.insert(facultyTable).values({
    name: parsed.data.name,
    subject: parsed.data.subject,
    qualification: parsed.data.qualification,
    photoUrl: parsed.data.photoUrl ?? null,
    sortOrder: parsed.data.sortOrder ?? 0,
  }).returning();

  res.status(201).json({ ...item, createdAt: item.createdAt.toISOString() });
});

router.patch("/faculty/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateFacultyMemberParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateFacultyMemberBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
  if (parsed.data.subject !== undefined) updateData.subject = parsed.data.subject;
  if (parsed.data.qualification !== undefined) updateData.qualification = parsed.data.qualification;
  if (parsed.data.photoUrl !== undefined) updateData.photoUrl = parsed.data.photoUrl;
  if (parsed.data.sortOrder !== undefined) updateData.sortOrder = parsed.data.sortOrder;

  const [item] = await db.update(facultyTable).set(updateData).where(eq(facultyTable.id, params.data.id)).returning();
  if (!item) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  res.json({ ...item, createdAt: item.createdAt.toISOString() });
});

router.delete("/faculty/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteFacultyMemberParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [item] = await db.delete(facultyTable).where(eq(facultyTable.id, params.data.id)).returning();
  if (!item) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;

import { Router, type IRouter } from "express";
import { db, galleryTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import {
  CreateGalleryItemBody,
  UpdateGalleryItemBody,
  UpdateGalleryItemParams,
  DeleteGalleryItemParams,
  ListGalleryQueryParams,
} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/requireAdmin.js";

const router: IRouter = Router();

router.get("/gallery", async (req, res): Promise<void> => {
  const query = ListGalleryQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  let dbQuery = db.select().from(galleryTable).orderBy(desc(galleryTable.createdAt)).$dynamic();

  if (query.data.category) {
    dbQuery = dbQuery.where(eq(galleryTable.category, query.data.category));
  }

  const results = await dbQuery;
  res.json(results.map(row => ({ ...row, createdAt: row.createdAt.toISOString() })));
});

router.post("/gallery", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateGalleryItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [item] = await db.insert(galleryTable).values({
    title: parsed.data.title,
    imageUrl: parsed.data.imageUrl,
    category: parsed.data.category,
  }).returning();

  res.status(201).json({ ...item, createdAt: item.createdAt.toISOString() });
});

router.patch("/gallery/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateGalleryItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateGalleryItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.title !== undefined) updateData.title = parsed.data.title;
  if (parsed.data.imageUrl !== undefined) updateData.imageUrl = parsed.data.imageUrl;
  if (parsed.data.category !== undefined) updateData.category = parsed.data.category;

  const [item] = await db.update(galleryTable).set(updateData).where(eq(galleryTable.id, params.data.id)).returning();
  if (!item) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  res.json({ ...item, createdAt: item.createdAt.toISOString() });
});

router.delete("/gallery/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteGalleryItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [item] = await db.delete(galleryTable).where(eq(galleryTable.id, params.data.id)).returning();
  if (!item) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;

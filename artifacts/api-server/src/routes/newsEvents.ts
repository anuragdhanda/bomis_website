import { Router, type IRouter } from "express";
import { db, newsEventsTable } from "@workspace/db";
import { eq, desc, count } from "drizzle-orm";
import {
  CreateNewsEventBody,
  UpdateNewsEventBody,
  GetNewsEventParams,
  UpdateNewsEventParams,
  DeleteNewsEventParams,
  ListNewsEventsQueryParams,
} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/requireAdmin.js";

const router: IRouter = Router();

router.get("/news-events", async (req, res): Promise<void> => {
  const query = ListNewsEventsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  let dbQuery = db.select().from(newsEventsTable).orderBy(desc(newsEventsTable.publishedAt)).$dynamic();

  if (query.data.type) {
    dbQuery = dbQuery.where(eq(newsEventsTable.type, query.data.type));
  }

  if (query.data.limit) {
    dbQuery = dbQuery.limit(query.data.limit);
  }

  const results = await dbQuery;
  res.json(results.map(row => ({
    ...row,
    publishedAt: row.publishedAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
  })));
});

router.get("/news-events/:id", async (req, res): Promise<void> => {
  const params = GetNewsEventParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [item] = await db.select().from(newsEventsTable).where(eq(newsEventsTable.id, params.data.id));
  if (!item) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  res.json({ ...item, publishedAt: item.publishedAt.toISOString(), createdAt: item.createdAt.toISOString() });
});

router.post("/news-events", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateNewsEventBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [item] = await db.insert(newsEventsTable).values({
    title: parsed.data.title,
    content: parsed.data.content,
    excerpt: parsed.data.excerpt ?? null,
    type: parsed.data.type,
    imageUrl: parsed.data.imageUrl ?? null,
    eventDate: parsed.data.eventDate ?? null,
  }).returning();

  res.status(201).json({ ...item, publishedAt: item.publishedAt.toISOString(), createdAt: item.createdAt.toISOString() });
});

router.patch("/news-events/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateNewsEventParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateNewsEventBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.title !== undefined) updateData.title = parsed.data.title;
  if (parsed.data.content !== undefined) updateData.content = parsed.data.content;
  if (parsed.data.excerpt !== undefined) updateData.excerpt = parsed.data.excerpt;
  if (parsed.data.type !== undefined) updateData.type = parsed.data.type;
  if (parsed.data.imageUrl !== undefined) updateData.imageUrl = parsed.data.imageUrl;
  if (parsed.data.eventDate !== undefined) updateData.eventDate = parsed.data.eventDate;

  const [item] = await db.update(newsEventsTable).set(updateData).where(eq(newsEventsTable.id, params.data.id)).returning();
  if (!item) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  res.json({ ...item, publishedAt: item.publishedAt.toISOString(), createdAt: item.createdAt.toISOString() });
});

router.delete("/news-events/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteNewsEventParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [item] = await db.delete(newsEventsTable).where(eq(newsEventsTable.id, params.data.id)).returning();
  if (!item) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  res.sendStatus(204);
});

export { count as newsEventsCount, newsEventsTable };
export default router;

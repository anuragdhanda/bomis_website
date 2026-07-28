import { Router, type IRouter } from "express";
import { db, inquiriesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import {
  CreateInquiryBody,
  UpdateInquiryBody,
  UpdateInquiryParams,
  DeleteInquiryParams,
  ListInquiriesQueryParams,
} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/requireAdmin.js";
import { sendInquiryEmail } from "../lib/mailer.js";
import { logger } from "../lib/logger.js";

const router: IRouter = Router();

router.get("/inquiries", requireAdmin, async (req, res): Promise<void> => {
  const query = ListInquiriesQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  let dbQuery = db.select().from(inquiriesTable).orderBy(desc(inquiriesTable.createdAt)).$dynamic();

  if (query.data.type) {
    dbQuery = dbQuery.where(eq(inquiriesTable.type, query.data.type));
  }

  const results = await dbQuery;
  res.json(results.map(row => ({ ...row, createdAt: row.createdAt.toISOString() })));
});

router.post("/inquiries", async (req, res): Promise<void> => {
  const parsed = CreateInquiryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [item] = await db.insert(inquiriesTable).values({
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone ?? null,
    message: parsed.data.message,
    type: parsed.data.type,
    studentName: parsed.data.studentName ?? null,
    gradeApplying: parsed.data.gradeApplying ?? null,
  }).returning();

  // Send email notification — fire-and-forget, never block the response
  sendInquiryEmail({
    type: parsed.data.type as "admission" | "contact",
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone ?? null,
    studentName: parsed.data.studentName ?? null,
    gradeApplying: parsed.data.gradeApplying ?? null,
    message: parsed.data.message,
  }).catch((err) => logger.error({ err }, "Failed to send inquiry email"));

  res.status(201).json({ ...item, createdAt: item.createdAt.toISOString() });
});

router.patch("/inquiries/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateInquiryParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateInquiryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.status !== undefined) updateData.status = parsed.data.status;

  const [item] = await db.update(inquiriesTable).set(updateData).where(eq(inquiriesTable.id, params.data.id)).returning();
  if (!item) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  res.json({ ...item, createdAt: item.createdAt.toISOString() });
});

router.delete("/inquiries/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteInquiryParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [item] = await db.delete(inquiriesTable).where(eq(inquiriesTable.id, params.data.id)).returning();
  if (!item) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;

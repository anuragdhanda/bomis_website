import { Router, type IRouter } from "express";
import { db, newsEventsTable, galleryTable, facultyTable, inquiriesTable } from "@workspace/db";
import { eq, count } from "drizzle-orm";

const router: IRouter = Router();

router.get("/stats", async (_req, res): Promise<void> => {
  const [newsCount] = await db.select({ count: count() }).from(newsEventsTable).where(eq(newsEventsTable.type, "news"));
  const [eventCount] = await db.select({ count: count() }).from(newsEventsTable).where(eq(newsEventsTable.type, "event"));
  const [galleryCount] = await db.select({ count: count() }).from(galleryTable);
  const [facultyCount] = await db.select({ count: count() }).from(facultyTable);
  const [newInquiries] = await db.select({ count: count() }).from(inquiriesTable).where(eq(inquiriesTable.status, "new"));
  const [totalInquiries] = await db.select({ count: count() }).from(inquiriesTable);

  res.json({
    totalNews: newsCount?.count ?? 0,
    totalEvents: eventCount?.count ?? 0,
    totalFaculty: facultyCount?.count ?? 0,
    totalGallery: galleryCount?.count ?? 0,
    newInquiries: newInquiries?.count ?? 0,
    totalInquiries: totalInquiries?.count ?? 0,
  });
});

export default router;

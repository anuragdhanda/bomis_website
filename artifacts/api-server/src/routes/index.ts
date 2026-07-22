import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import newsEventsRouter from "./newsEvents";
import galleryRouter from "./gallery";
import facultyRouter from "./faculty";
import inquiriesRouter from "./inquiries";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(newsEventsRouter);
router.use(galleryRouter);
router.use(facultyRouter);
router.use(inquiriesRouter);
router.use(statsRouter);

export default router;

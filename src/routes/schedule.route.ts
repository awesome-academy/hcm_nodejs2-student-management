import * as scheduleController from "../controllers/schedule.controller";
import { Router } from "express";
const router: Router = Router();

router.get("/", scheduleController.getSchedules);

export default router;

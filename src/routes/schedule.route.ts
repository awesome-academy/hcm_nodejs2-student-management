import * as scheduleController from "../controllers/schedule.controller";
import * as authMiddlewares from "../middlewares/auth.middleware";
import { Router } from "express";
const router: Router = Router();

router.get("/", authMiddlewares.isAuth, scheduleController.getSchedules);

export default router;

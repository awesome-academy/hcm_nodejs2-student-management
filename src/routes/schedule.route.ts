import * as scheduleController from "../controllers/staff/schedule.controller";
import * as authMiddlewares from "../middlewares/auth.middleware";
import { Router } from "express";
const router: Router = Router();

router.get("/", authMiddlewares.isAuth, scheduleController.getSchedules);
router.post("/", authMiddlewares.isAuth, scheduleController.createSchedule);

router.post(
  "/update",
  authMiddlewares.isAuth,
  scheduleController.updateSchedule
);
router.post(
  "/delete",
  authMiddlewares.isAuth,
  scheduleController.deleteSchedule
);
export default router;

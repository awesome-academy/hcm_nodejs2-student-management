import * as scheduleController from "../controllers/staff/schedule.controller";
import * as authMiddlewares from "../middlewares/auth.middleware";
import { Router } from "express";
const router: Router = Router();

router.get(
  "/",
  authMiddlewares.isAuth,
  authMiddlewares.isStaff,
  scheduleController.getSchedules
);
router.post(
  "/",
  authMiddlewares.isAuth,
  authMiddlewares.isStaff,
  scheduleController.createSchedule
);

router.post(
  "/update",
  authMiddlewares.isAuth,
  authMiddlewares.isStaff,
  scheduleController.updateSchedule
);
router.post(
  "/delete",
  authMiddlewares.isAuth,
  authMiddlewares.isStaff,
  scheduleController.deleteSchedule
);

export default router;

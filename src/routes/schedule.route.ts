import * as scheduleController from "../controllers/staff/schedule.controller";
import * as studentScheduleController from "../controllers/student/schedule.controller";
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

router.get(
  "/student-schedule",
  authMiddlewares.isAuth,
  authMiddlewares.isStudent,
  studentScheduleController.getSchedules
);

export default router;

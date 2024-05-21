import * as scheduleController from "../controllers/staff/schedule.controller";
import * as studentScheduleController from "../controllers/student/schedule.controller";
import * as teacherScheduleController from "../controllers/teacher/schedule.controller";
import * as authMiddlewares from "../middlewares/auth.middleware";
import { Router } from "express";
const router: Router = Router();

// routes for staff
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

// routes for student
router.get(
  "/student-schedule",
  authMiddlewares.isAuth,
  authMiddlewares.isStudent,
  studentScheduleController.getSchedules
);

// routes for teacher
router.get(
  "/teacher-schedule",
  authMiddlewares.isAuth,
  authMiddlewares.isTeacher,
  teacherScheduleController.getSchedules
);

export default router;

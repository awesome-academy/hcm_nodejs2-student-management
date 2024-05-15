import * as teacherController from "../controllers/staff/teacher.controller";
import * as authMiddlewares from "../middlewares/auth.middleware";
import { Router } from "express";
const router: Router = Router();

router.get(
  "/",
  authMiddlewares.isAuth,
  authMiddlewares.isStaff,
  teacherController.getTeachers
);
router.post(
  "/",
  authMiddlewares.isAuth,
  authMiddlewares.isStaff,
  teacherController.createTeacher
);

router.get(
  "/teachers-by-schedule",
  authMiddlewares.isAuth,
  authMiddlewares.isStaff,
  teacherController.getAvailableTeachers
);
router.get(
  "/is-available",
  authMiddlewares.isAuth,
  authMiddlewares.isStaff,
  teacherController.checkAvailableTeacher
);

router.post(
  "/:id/update",
  authMiddlewares.isAuth,
  authMiddlewares.isStaff,
  teacherController.updateTeacher
);
router.post(
  "/:id/delete",
  authMiddlewares.isAuth,
  authMiddlewares.isStaff,
  teacherController.deleteTeacher
);

export default router;

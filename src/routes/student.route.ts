import * as staffStudentController from "../controllers/staff/student.controller";
import * as teacherStudentController from "../controllers/teacher/student.controller";
import * as authMiddlewares from "../middlewares/auth.middleware";
import { Router } from "express";
const router: Router = Router();

// routes for staff
router.get(
  "/",
  authMiddlewares.isAuth,
  authMiddlewares.isStaff,
  staffStudentController.getStudents
);
router.get(
  "/available-students",
  authMiddlewares.isAuth,
  authMiddlewares.isStaff,
  staffStudentController.getAvailableStudents
);
router.post(
  "/",
  authMiddlewares.isAuth,
  authMiddlewares.isStaff,
  staffStudentController.createStudent
);

router.post(
  "/:id/update",
  authMiddlewares.isAuth,
  authMiddlewares.isStaff,
  staffStudentController.updateStudent
);
router.post(
  "/:id/delete",
  authMiddlewares.isAuth,
  authMiddlewares.isStaff,
  staffStudentController.deleteStudent
);

// routes for teacher
router.post(
  "/:id/update-conduct",
  authMiddlewares.isAuth,
  authMiddlewares.isTeacher,
  teacherStudentController.updateConductStudent
);

export default router;

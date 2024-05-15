import * as classStaffController from "../controllers/staff/class.controller";
import * as classStudentController from "../controllers/student/class.controller";
import { Router } from "express";
import * as authMiddlewares from "../middlewares/auth.middleware";
const router: Router = Router();

// Routes for staff
router.get(
  "/",
  authMiddlewares.isAuth,
  authMiddlewares.isStaff,
  classStaffController.getClasses
);
router.post(
  "/",
  authMiddlewares.isAuth,
  authMiddlewares.isStaff,
  classStaffController.createClass
);

router.get(
  "/classes-by-grade/:gradeId",
  authMiddlewares.isAuth,
  authMiddlewares.isStaff,
  classStaffController.getClassesByGrade
);

router.post(
  "/:id/update",
  authMiddlewares.isAuth,
  authMiddlewares.isStaff,
  classStaffController.updateClass
);
router.post(
  "/:id/delete",
  authMiddlewares.isAuth,
  authMiddlewares.isStaff,
  classStaffController.deleteClass
);

// Routes for student
router.get(
  "/my-class",
  authMiddlewares.isAuth,
  authMiddlewares.isStudent,
  classStudentController.getStudentClass
);

export default router;

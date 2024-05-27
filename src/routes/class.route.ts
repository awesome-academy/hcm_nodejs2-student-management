import * as classStaffController from "../controllers/staff/class.controller";
import * as classStudentController from "../controllers/student/class.controller";
import * as classHomeRoomController from "../controllers/teacher/class.controller";
import * as scoreController from "../controllers/teacher/scoreboard.controller";
import { Router } from "express";
import * as authMiddlewares from "../middlewares/auth.middleware";
const router: Router = Router();

// Routes for student
router.get(
  "/my-class",
  authMiddlewares.isAuth,
  authMiddlewares.isStudent,
  classStudentController.getStudentClass
);

// Routes for teacher
router.get(
  "/homeroom-class",
  authMiddlewares.isAuth,
  authMiddlewares.isTeacher,
  classHomeRoomController.getHomeRoomClass
);
router.get(
  "/teachings",
  authMiddlewares.isAuth,
  authMiddlewares.isTeacher,
  classHomeRoomController.getTeachingClasses
);
router.get(
  "/teachings/:id",
  authMiddlewares.isAuth,
  authMiddlewares.isTeacher,
  scoreController.getScoreboard
);

// Routes for staff
router.get(
  "/",
  authMiddlewares.isAuth,
  authMiddlewares.isStaff,
  classStaffController.getClasses
);
router.get(
  "/:id",
  authMiddlewares.isAuth,
  authMiddlewares.isStaff,
  classStaffController.getClassDetail
);
router.post(
  "/:id/add-student",
  authMiddlewares.isAuth,
  authMiddlewares.isStaff,
  classStaffController.addStudentToClass
);
router.post(
  "/:id/remove-student",
  authMiddlewares.isAuth,
  authMiddlewares.isStaff,
  classStaffController.removeStudentFromClass
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

export default router;

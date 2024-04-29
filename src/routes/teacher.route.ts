import * as teacherController from "../controllers/staff/teacher.controller";
import * as authMiddlewares from "../middlewares/auth.middleware";
import { Router } from "express";
const router: Router = Router();

router.get("/", authMiddlewares.isAuth, teacherController.getTeachers);
router.post("/", authMiddlewares.isAuth, teacherController.createTeacher);

router.post(
  "/:id/update",
  authMiddlewares.isAuth,
  teacherController.updateTeacher
);
router.post(
  "/:id/delete",
  authMiddlewares.isAuth,
  teacherController.deleteTeacher
);

export default router;

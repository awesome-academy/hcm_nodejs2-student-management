import * as studentController from "../controllers/staff/student.controller";
import * as authMiddlewares from "../middlewares/auth.middleware";
import { Router } from "express";
const router: Router = Router();

router.get("/", authMiddlewares.isAuth, studentController.getStudents);
router.post("/", authMiddlewares.isAuth, studentController.createStudent);

router.post(
  "/:id/update",
  authMiddlewares.isAuth,
  studentController.updateStudent
);
router.post(
  "/:id/delete",
  authMiddlewares.isAuth,
  studentController.deleteStudent
);
export default router;

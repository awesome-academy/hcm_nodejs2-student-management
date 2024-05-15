import * as studentController from "../controllers/staff/student.controller";
import * as authMiddlewares from "../middlewares/auth.middleware";
import { Router } from "express";
const router: Router = Router();

router.get(
  "/",
  authMiddlewares.isAuth,
  authMiddlewares.isStaff,
  studentController.getStudents
);
router.post(
  "/",
  authMiddlewares.isAuth,
  authMiddlewares.isStaff,
  studentController.createStudent
);

router.post(
  "/:id/update",
  authMiddlewares.isAuth,
  authMiddlewares.isStaff,
  studentController.updateStudent
);
router.post(
  "/:id/delete",
  authMiddlewares.isAuth,
  authMiddlewares.isStaff,
  studentController.deleteStudent
);

export default router;

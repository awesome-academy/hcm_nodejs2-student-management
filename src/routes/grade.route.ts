import * as gradeController from "../controllers/staff/grade.controller";
import * as authMiddlewares from "../middlewares/auth.middleware";
import { Router } from "express";
const router: Router = Router();

router.get(
  "/",
  authMiddlewares.isAuth,
  authMiddlewares.isStaff,
  gradeController.getGrades
);
router.post(
  "/",
  authMiddlewares.isAuth,
  authMiddlewares.isStaff,
  gradeController.updateGrades
);

export default router;

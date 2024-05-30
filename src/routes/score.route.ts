import * as scoreController from "../controllers/teacher/scoreboard.controller";
import * as studentScoreController from "../controllers/student/scoreboard.controller";
import { Router } from "express";
import * as authMiddlewares from "../middlewares/auth.middleware";
const router: Router = Router();

// Routes for student
router.get(
  "/",
  authMiddlewares.isAuth,
  authMiddlewares.isStudent,
  studentScoreController.getScoreboard
);

// Routes for teacher
router.post(
  "/",
  authMiddlewares.isAuth,
  authMiddlewares.isTeacher,
  scoreController.createScore
);
router.post(
  "/:id/update",
  authMiddlewares.isAuth,
  authMiddlewares.isTeacher,
  scoreController.updateScore
);

export default router;

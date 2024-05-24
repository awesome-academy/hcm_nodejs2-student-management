import * as scoreController from "../controllers/teacher/scoreboard.controller";
import { Router } from "express";
import * as authMiddlewares from "../middlewares/auth.middleware";
const router: Router = Router();

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

import * as gradeController from "../controllers/grade.controller";
import * as authMiddlewares from '../middlewares/auth.middleware'
import { Router } from "express";
const router: Router = Router();

router.get("/", authMiddlewares.isAuth, gradeController.getGrades);
router.post("/", authMiddlewares.isAuth, gradeController.updateGrades);

export default router;

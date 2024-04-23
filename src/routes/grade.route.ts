import * as gradeController from "../controllers/grade.controller";
import * as authMiddlewares from '../middlewares/auth.middleware'
import { Router } from "express";
const router: Router = Router();

router.get("/", authMiddlewares.isAuth, gradeController.getGrades);

export default router;

import * as gradeController from "../controllers/grade.controller";
import { Router } from "express";
const router: Router = Router();

router.get("/", gradeController.getGrades);

export default router;

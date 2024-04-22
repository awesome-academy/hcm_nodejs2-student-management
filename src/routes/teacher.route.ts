import * as teacherController from "../controllers/teacher.controller";
import { Router } from "express";
const router: Router = Router();

router.get("/", teacherController.getTeachers);

export default router;

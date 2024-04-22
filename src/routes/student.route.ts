import * as studentController from "../controllers/student.controller";
import { Router } from "express";
const router: Router = Router();

router.get("/", studentController.getStudents);

export default router;

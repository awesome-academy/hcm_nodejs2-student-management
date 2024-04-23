import * as studentController from "../controllers/student.controller";
import * as authMiddlewares from '../middlewares/auth.middleware'
import { Router } from "express";
const router: Router = Router();

router.get("/", authMiddlewares.isAuth, studentController.getStudents);

export default router;

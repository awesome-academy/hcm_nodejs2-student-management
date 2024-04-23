import * as teacherController from "../controllers/teacher.controller";
import * as authMiddlewares from '../middlewares/auth.middleware'
import { Router } from "express";
const router: Router = Router();

router.get("/", authMiddlewares.isAuth, teacherController.getTeachers);

export default router;

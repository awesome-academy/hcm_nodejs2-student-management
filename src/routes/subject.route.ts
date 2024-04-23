import * as subjectController from "../controllers/subject.controller";
import * as authMiddlewares from '../middlewares/auth.middleware'
import { Router } from "express";
const router: Router = Router();

router.get("/", authMiddlewares.isAuth, subjectController.getSubjects);

export default router;

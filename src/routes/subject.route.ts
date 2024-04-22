import * as subjectController from "../controllers/subject.controller";
import { Router } from "express";
const router: Router = Router();

router.get("/", subjectController.getSubjects);

export default router;

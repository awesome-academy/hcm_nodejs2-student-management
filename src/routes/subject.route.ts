import * as subjectController from "../controllers/subject.controller";
import * as authMiddlewares from '../middlewares/auth.middleware'
import { Router } from "express";
const router: Router = Router();

router.get("/", authMiddlewares.isAuth, subjectController.getSubjects);
router.post("/", authMiddlewares.isAuth, subjectController.createSubject);

router.post("/:id/update", authMiddlewares.isAuth, subjectController.updateSubject);
router.post("/:id/delete", authMiddlewares.isAuth, subjectController.deleteSubject);

export default router;

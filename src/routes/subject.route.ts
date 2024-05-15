import * as subjectController from "../controllers/staff/subject.controller";
import * as authMiddlewares from "../middlewares/auth.middleware";
import { Router } from "express";
const router: Router = Router();

router.get(
  "/",
  authMiddlewares.isAuth,
  authMiddlewares.isStaff,
  subjectController.getSubjects
);
router.post(
  "/",
  authMiddlewares.isAuth,
  authMiddlewares.isStaff,
  subjectController.createSubject
);

router.post(
  "/:id/update",
  authMiddlewares.isAuth,
  authMiddlewares.isStaff,
  subjectController.updateSubject
);
router.post(
  "/:id/delete",
  authMiddlewares.isAuth,
  authMiddlewares.isStaff,
  subjectController.deleteSubject
);

export default router;

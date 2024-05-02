import * as classController from "../controllers/staff/class.controller";
import { Router } from "express";
import * as authMiddlewares from "../middlewares/auth.middleware";
const router: Router = Router();

router.get("/", authMiddlewares.isAuth, classController.getClasses);
router.post("/", authMiddlewares.isAuth, classController.createClass);

router.get(
  "/classes-by-grade/:gradeId",
  authMiddlewares.isAuth,
  classController.getClassesByGrade
);

router.post("/:id/update", authMiddlewares.isAuth, classController.updateClass);
router.post("/:id/delete", authMiddlewares.isAuth, classController.deleteClass);

export default router;

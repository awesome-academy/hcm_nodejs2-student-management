import * as classController from "../controllers/class.controller";
import { Router } from "express";
import * as authMiddlewares from '../middlewares/auth.middleware'
const router: Router = Router();

router.get("/", authMiddlewares.isAuth, classController.getClasses);

export default router;

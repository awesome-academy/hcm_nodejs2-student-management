import * as classController from "../controllers/class.controller";
import { Router } from "express";
const router: Router = Router();

router.get("/", classController.getClasses);

export default router;

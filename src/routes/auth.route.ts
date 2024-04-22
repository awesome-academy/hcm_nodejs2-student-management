import * as authController from "../controllers/auth.controller";
import { Router } from "express";
const router: Router = Router();

router.get("/login", authController.getLoginPage);

export default router;

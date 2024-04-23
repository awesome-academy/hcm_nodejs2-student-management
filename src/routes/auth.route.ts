import * as authController from "../controllers/auth.controller";
import { Router } from "express";
const router: Router = Router();

router.get("/login", authController.getLoginPage);
router.post("/login", authController.login);
router.post("/logout", authController.logout)

export default router;

import express from "express";
import {
    forgetPasswordController, getUserByIdController, loginController, logoutController, registerController,
    resetPasswordController, verifyEmailController
} from "../controllers/authController.js";
import { validateOtpEmailVerification, validateRegistrationRules } from "../middlewares/validationMiddlewere.js";
import authenticatedRoutes from "../middlewares/authMiddleware.js";
const router = express.Router();

router.post("/login", loginController);
router.post("/logout", authenticatedRoutes, logoutController);
router.get("/user/:userId", authenticatedRoutes, getUserByIdController);
router.post("/register", validateRegistrationRules, registerController);
router.post("/email-verification", validateOtpEmailVerification, verifyEmailController);
router.post("/forget-password", forgetPasswordController);
router.post("/reset-password", resetPasswordController);

export default router;

import express from "express";
import {
    forgetPasswordController, getAllUsersController, getUserByIdController, loginController, logoutController, phoneVerificationController, registerController,
    resetPasswordController, sendOtpController, verifyEmailController
} from "../controllers/authController.js";
import { validateOtpVerification, validateRegistrationRules } from "../middlewares/validationMiddlewere.js";
import { authenticatedRoutes, authorizeRoles } from "../middlewares/authMiddleware.js";
import {loginLimiter} from "../middlewares/LoginLimiter.js";
const router = express.Router();

router.post("/login",loginLimiter, loginController);
router.post("/logout", authenticatedRoutes, logoutController);
router.get("/user", authenticatedRoutes, getUserByIdController);
router.get("/users", authenticatedRoutes, authorizeRoles("admin"), getAllUsersController);
router.post("/register", validateRegistrationRules, registerController);
router.post("/email-verification", validateOtpVerification, verifyEmailController);
router.post("/forget-password", forgetPasswordController);
router.post("/reset-password", resetPasswordController);
router.post("/send-phone-otp",authenticatedRoutes, sendOtpController);
router.post("/phone-verification",authenticatedRoutes, phoneVerificationController);
export default router;

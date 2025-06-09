import express from "express";
import { loginController, registerController } from "../controllers/authController.js";
import { validateRegistrationRules } from "../middlewares/validationMiddlewere.js";
const router = express.Router();

router.get("/users", (req, res) => { });

router.post("/register", validateRegistrationRules, registerController);

router.post("/login", loginController);

router.post("/logout", (req, res) => { });

export default router;

import express from "express";
import { loginController, registerController } from "../controllers/authController.js";
const router = express.Router();

router.get("/users", (req, res) => {});

router.post("/register", registerController);

router.post("/login", loginController);

router.post("/logout", (req, res) => {});

export default router;

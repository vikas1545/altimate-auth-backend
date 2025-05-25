import express from "express";
import { registerController } from "../controllers/authController.js";
const router = express.Router();

router.get("/users", (req, res) => {});

router.post("/register", registerController);

router.post("/login", (req, res) => {});

router.post("/logout", (req, res) => {});

export default router;

import express from "express";
import { requireAuth } from "../middlewares/auth.js";
import { generateToken } from "../controllers/hmsController.js";

const router = express.Router();


router.post("/generate-token", requireAuth, generateToken);

export default router;
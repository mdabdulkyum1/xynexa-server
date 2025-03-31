import express from "express";

import { handleClerkWebhook } from "../controllers/webhookController.js";
const router = express.Router();

// Webhook route for Clerk
router.post("/clerk/webhook", handleClerkWebhook);

export default router;
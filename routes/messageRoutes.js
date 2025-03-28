import express from 'express';
import { getMessages, sendMessage, markAsRead } from '../controllers/messageController.js';

const router = express.Router();

router.get("/messages",  getMessages);
router.post("/send", sendMessage);
router.put("/read", markAsRead);

export default router;
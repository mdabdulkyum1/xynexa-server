import express from 'express';
import { getMessages, sendMessage, markAsRead, deleteMessage } from '../controllers/messageController.js';

const router = express.Router();

router.get("/messages",  getMessages);
router.post("/messages/send", sendMessage);
router.put("/read", markAsRead);
router.delete("/messages/:id", deleteMessage);

export default router;
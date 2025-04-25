import express from 'express';
import { getGroupMessages, sendGroupMessage } from '../controllers/groupMessageController.js';

const router = express.Router();

router.post("/groupMessage/send", sendGroupMessage);
router.get("/groupMessage/:groupId", getGroupMessages);


export default router
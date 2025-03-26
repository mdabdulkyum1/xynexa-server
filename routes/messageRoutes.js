const express = require('express');
const { getMessages, sendMessage, markAsRead } = require("../controllers/messageController");


const router = express.Router();

router.get("/messages",  getMessages);
router.post("/send", sendMessage);
router.put("/read", markAsRead);

module.exports = router;

const Message = require("../models/messageModel");

// Fetch Chat History
 const getMessages = async (req, res) => {
  try {
    const { senderId, receiverId } = req.query;
    console.log(senderId, receiverId);
    const messages = await Message.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    }).sort("timestamp");

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};

// Send Message
 const sendMessage = async (req, res) => {
  try {
    const { senderId, receiverId, text } = req.body;
    const newMessage = new Message({ senderId, receiverId, text });
    await newMessage.save();

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};

// Mark Message as Read
 const markAsRead = async (req, res) => {
  try {
    const { messageId } = req.body;
    await Message.findByIdAndUpdate(messageId, { read: true });

    res.json({ messageId, read: true });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};


module.exports = { getMessages, sendMessage, markAsRead };
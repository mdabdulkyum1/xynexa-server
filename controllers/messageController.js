
import Message from "../models/messageModel.js";
// Fetch Chat History
 export const getMessages = async (req, res) => {
  try {
    const { senderId, receiverId } = req.query;
    
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
 export const sendMessage = async (req, res) => {
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
 export const markAsRead = async (req, res) => {
  try {
    const { messageId } = req.body;
    await Message.findByIdAndUpdate(messageId, { read: true });

    res.json({ messageId, read: true });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};


// Delete Message
export const deleteMessage = async (req, res) => {
  try {
    const messageId = req.params.id; 
    const deletedMessage = await Message.findByIdAndDelete(messageId);

    if (!deletedMessage) {
      return res.status(404).send({ error: "Message not found" });
    }

    res.send({ success: true, id: messageId });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};




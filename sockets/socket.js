
import Board from "../models/boardModel.js"; 
import Message from '../models/messageModel.js'; 
import User from '../models/userModel.js'; 

export function setupSocket(io) {


  const connectedUsers = {};

  const connectedGroups = {};

  io.on("connection", (socket) => {
    console.log("🔌 New client connected");

    socket.on("join", ({ userId }) => {
      if (!userId) return;
      socket.join(userId);
      connectedUsers[userId] = socket.id;
      console.log(`👤 User ${userId} joined`);
    });

    socket.on("sendMessage", (message) => {
      const { receiverId, senderId } = message;
      if (!receiverId || !senderId) {
        console.error("Invalid message data: missing receiverId or senderId");
        return;
      }
      // Emit message only to the intended receiver
      io.to(receiverId).emit("receiveMessage", message);
    });

    socket.on("typing", ({ senderId, receiverId }) => {
      if (receiverId && senderId) {
        io.to(receiverId).emit("typing", { senderId });
      }
    });

    socket.on("stopTyping", ({ receiverId }) => {
      if (receiverId) {
        io.to(receiverId).emit("stopTyping");
      }
    });



    socket.on("messageRead", async ({ _id: messageId, receiverId }) => {
      try {
        const updatedMessage = await Message.findByIdAndUpdate(
          messageId,
          { read: true },
          { new: true }
        );

        if (!updatedMessage) {
          console.log("Message not found!");
          return;
        }

        io.to(receiverId).emit("messageRead", { id: messageId });

      } catch (error) {
        console.error("Error updating message read status:", error);
      }
    });


    socket.on("deleteMessage", ({ messageId, receiverId }) => {
      if (messageId && receiverId) {
        io.to(receiverId).emit("messageDeleted", { messageId });
      }
    });

    // GROUP CHAT SOCKETS
    socket.on("joinGroup", ({ groupId }) => {
      if (!groupId) return;
      socket.join(groupId);
      connectedGroups[groupId] = socket.id;
      console.log(`👤 User ${groupId} joined _______________`);
    });

    socket.on("sentGroupMessage", async (groupMsg) => {
      const { senderId, groupId, newMessage, messageId } = groupMsg;
      if (!groupId || !senderId || !newMessage) {
        console.error("Invalid message data: missing receiverId or senderId");
        return;
      }

      try {
        const sender = await User.findById(senderId).select('firstName email imageUrl');
        if (!sender) {
          console.error("Sender not found:", senderId);
          return;
        }

        // Now create final message format
        const populatedMsg = {
          _id: messageId,
          senderId: {
            _id: sender._id,
            firstName: sender.firstName,
            email: sender.email,
            imageUrl: sender?.imageUrl,
          },
          groupId,
          message: newMessage,
          timestamp: new Date().toISOString(),
        };
        // Emit message only to the intended receiver
        io.to(groupId).emit("receiveGroupMessage", populatedMsg);

      }
      catch (err) {
        console.error("Error saving group message:", err);
      }
    });




    // Update Board Task Status in Real-Time
    socket.on("update-task-status", async ({ boardId, newStatus }) => {
      try {
        const updatedBoard = await Board.findByIdAndUpdate(
          boardId,
          { status: newStatus, updatedAt: new Date() },
          { new: true }
        ).populate("members comments.user attachments.user");

        if (!updatedBoard) {
          console.error(`❌ Board not found: ${boardId}`);
          return;
        }

        // Notify all members about the update
        updatedBoard.members.forEach((member) => {
          const socketId = connectedUsers[member._id.toString()];
          if (socketId) {
            io.to(socketId).emit("boardStatusUpdated", updatedBoard);
          }
        });
      } catch (err) {
        console.error("❌ Error updating board status:", err);
      }
    });

    socket.on("disconnect", () => {
      for (const [userId, sId] of Object.entries(connectedUsers)) {
        if (sId === socket.id) {
          delete connectedUsers[userId];
          console.log(`🚪 User ${userId} disconnected`);
          break;
        }
      }
    });
  });
}
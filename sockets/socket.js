
import Board from "../models/boardModel.js";
import Message from "../models/messageModel.js";
import User from "../models/userModel.js";

export function setupSocket(io) {

  const connectedUsers = {};

  const connectedGroups = {};


  const onlineUsers = new Map(); 

  const broadcastOnlineUsers = () => {
    const users = Array.from(onlineUsers.keys());
    io.emit("online-users", users);
  };

  io.on("connection", (socket) => {
    console.log("🔌 New client connected:", socket.id);

    /* =========================
       USER JOIN / ONLINE SYSTEM
       ======================= */
    socket.on("join", ({ userId }) => {
      if (!userId) return;

      socket.join(userId);

      connectedUsers[userId] = socket.id;

      onlineUsers.set(userId, socket.id);

      console.log(`👤 User ${userId} joined & is ONLINE`);

      io.emit("user-online-status", {
        userId,
        status: "online",
      });

      broadcastOnlineUsers();
    });

    /* =======================
       PRIVATE CHAT SOCKETS
       ======================= */

    socket.on("sendMessage", (message) => {
      const { receiverId, senderId } = message;
      if (!receiverId || !senderId) {
        console.error("Invalid message data: missing receiverId or senderId");
        return;
      }

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

    /* =======================
       MESSAGE READ / DELETE
       ======================= */

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

    /* =======================
       GROUP CHAT SOCKETS
       ======================= */

    socket.on("joinGroup", ({ groupId }) => {
      if (!groupId) return;
      socket.join(groupId);
      connectedGroups[groupId] = socket.id;
      console.log(`👥 User joined group ${groupId}`);
    });

    socket.on("sentGroupMessage", async (groupMsg) => {
      console.log("Group message sent:", groupMsg);
      const { senderId, groupId, newMessage, messageId } = groupMsg;
      if (!groupId || !senderId || !newMessage) {
        console.error("Invalid message data: missing receiverId or senderId");
        return;
      }

      try {
        const sender = await User.findById(senderId).select(
          "firstName email imageUrl"
        );
        if (!sender) {
          console.error("Sender not found:", senderId);
          return;
        }

        const populatedMsg = {
          _id: messageId,
          senderId: {
            _id: sender._id,
            firstName: sender.firstName,
            email: sender.email,
            imageUrl: sender.imageUrl,
          },
          groupId,
          message: newMessage,
          timestamp: new Date().toISOString(),
        };

        console.log("Populated message:", populatedMsg);

        io.to(groupId).emit("receiveGroupMessage", populatedMsg);
      } catch (err) {
        console.error("Error saving group message:", err);
      }
    });

    /* =======================
       BOARD STATUS UPDATE
       ======================= */

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

    /* =======================
       MANUAL OFFLINE (LOGOUT)
       ======================= */

    socket.on("user-offline", ({ userId }) => {
      if (!userId) return;

      // map থেকে remove
      onlineUsers.delete(userId);
      delete connectedUsers[userId];

      console.log(`🚪 User ${userId} went OFFLINE (logout)`);

      io.emit("user-online-status", {
        userId,
        status: "offline",
      });

      broadcastOnlineUsers();
    });

    /* =======================
       DISCONNECT HANDLE
       ======================= */

    socket.on("disconnect", () => {
      console.log("🔌 Client disconnected:", socket.id);

      let disconnectedUserId = null;

      for (const [userId, sId] of Object.entries(connectedUsers)) {
        if (sId === socket.id) {
          disconnectedUserId = userId;
          delete connectedUsers[userId];
          break;
        }
      }

      if (disconnectedUserId) {
        onlineUsers.delete(disconnectedUserId);

        console.log(`🚪 User ${disconnectedUserId} is OFFLINE (disconnect)`);

        io.emit("user-online-status", {
          userId: disconnectedUserId,
          status: "offline",
        });

        broadcastOnlineUsers();
      }
    });
  });
}

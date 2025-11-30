

import Board from "../models/boardModel.js";
import Message from "../models/messageModel.js";
import User from "../models/userModel.js";

export function setupSocket(io) {
  // userId -> socketId (chat, board, group)
  const connectedUsers = {};

  const connectedGroups = {};

  // email -> socketId (online/offline tracking)
  const onlineEmails = new Map();

  const broadcastOnlineEmails = () => {
    const emails = Array.from(onlineEmails.keys()); 
    io.emit("online-users", emails);
  };

  io.on("connection", (socket) => {
    console.log("🔌 New client connected:", socket.id);

    /* =========================
       USER JOIN / ONLINE SYSTEM (email based)
       ======================= */
    socket.on("join", async ({ email }) => {
      if (!email) return;

      socket.join(email);
      onlineEmails.set(email, socket.id);

      console.log(`👤 User ${email} joined & is ONLINE`);

      try {
        await User.findOneAndUpdate(
          { email },
          { status: "Online", lastActive: new Date() },
          { new: true }
        );
      } catch (err) {
        console.error("Error updating user status to Online:", err);
      }

      io.emit("user-online-status", { email, status: "Online" });
      broadcastOnlineEmails();
    });

    socket.on("user-offline", async ({ email }) => {
      if (!email) return;

      onlineEmails.delete(email);

      console.log(`🚪 User ${email} went OFFLINE (logout)`);

      try {
        await User.findOneAndUpdate(
          { email },
          { status: "Offline", lastActive: new Date() },
          { new: true }
        );
      } catch (err) {
        console.error("Error updating user status to Offline (logout):", err);
      }

      io.emit("user-online-status", { email, status: "Offline" });
      broadcastOnlineEmails();
    });

    /* =======================
       PRIVATE CHAT SOCKETS (userId based)
       ======================= */
    socket.on("sendMessage", (message) => {
      const { receiverId, senderId } = message;
      if (!receiverId || !senderId) return;
      io.to(receiverId).emit("receiveMessage", message);
    });

    socket.on("typing", ({ senderId, receiverId }) => {
      if (receiverId && senderId) io.to(receiverId).emit("typing", { senderId });
    });

    socket.on("stopTyping", ({ receiverId }) => {
      if (receiverId) io.to(receiverId).emit("stopTyping");
    });

    socket.on("messageRead", async ({ _id: messageId, receiverId }) => {
      try {
        const updatedMessage = await Message.findByIdAndUpdate(
          messageId,
          { read: true },
          { new: true }
        );
        if (!updatedMessage) return;
        io.to(receiverId).emit("messageRead", { id: messageId });
      } catch (error) {
        console.error("Error updating message read status:", error);
      }
    });

    socket.on("deleteMessage", ({ messageId, receiverId }) => {
      if (messageId && receiverId) io.to(receiverId).emit("messageDeleted", { messageId });
    });

    /* =======================
       GROUP CHAT SOCKETS (userId based)
       ======================= */
    socket.on("joinGroup", ({ groupId }) => {
      if (!groupId) return;
      socket.join(groupId);
      connectedGroups[groupId] = socket.id;
    });

    socket.on("sentGroupMessage", async (groupMsg) => {
      const { senderId, groupId, newMessage, messageId } = groupMsg;
      if (!groupId || !senderId || !newMessage) return;

      try {
        const sender = await User.findById(senderId).select("firstName email imageUrl");
        if (!sender) return;

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

        io.to(groupId).emit("receiveGroupMessage", populatedMsg);
      } catch (err) {
        console.error("Error sending group message:", err);
      }
    });

    /* =======================
       BOARD STATUS UPDATE (userId based)
       ======================= */
    socket.on("update-task-status", async ({ boardId, newStatus }) => {
      try {
        const updatedBoard = await Board.findByIdAndUpdate(
          boardId,
          { status: newStatus, updatedAt: new Date() },
          { new: true }
        ).populate("members comments.user attachments.user");

        if (!updatedBoard) return;

        updatedBoard.members.forEach((member) => {
          const socketId = connectedUsers[member._id.toString()];
          if (socketId) io.to(socketId).emit("boardStatusUpdated", updatedBoard);
        });
      } catch (err) {
        console.error("Error updating board status:", err);
      }
    });

    /* =======================
       DISCONNECT HANDLE (email based for online/offline)
       ======================= */
    socket.on("disconnect", async () => {
      console.log("🔌 Client disconnected:", socket.id);

      let disconnectedEmail = null;

      for (const [email, sId] of Object.entries(Object.fromEntries(onlineEmails))) {
        if (sId === socket.id) {
          disconnectedEmail = email;
          onlineEmails.delete(email);
          break;
        }
      }

      if (disconnectedEmail) {
        console.log(`🚪 User ${disconnectedEmail} is OFFLINE (disconnect)`);

        try {
          await User.findOneAndUpdate(
            { email: disconnectedEmail },
            { status: "Offline", lastActive: new Date() },
            { new: true }
          );
        } catch (err) {
          console.error("Error updating user status to Offline (disconnect):", err);
        }

        io.emit("user-online-status", { email: disconnectedEmail, status: "Offline" });
        broadcastOnlineEmails();
      }
    });
  });
}

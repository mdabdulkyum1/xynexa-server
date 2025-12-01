import Board from "../models/boardModel.js";
import Message from "../models/messageModel.js";
import User from "../models/userModel.js";

export function setupSocket(io) {
  const onlineEmails = new Map(); // email → socket.id

  const broadcastOnlineEmails = () => {
    const emails = Array.from(onlineEmails.keys());
    io.emit("online-users", emails);
  };

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    /* =======================
       1. USER JOIN / ONLINE (email based)
       ======================= */
    socket.on("join", async ({ email }) => {
      if (!email) return;

      socket.join(email);
      onlineEmails.set(email, socket.id);

      console.log(`User ${email} is ONLINE`);

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

    /* =======================
       2. USER OFFLINE (manual logout)
       ======================= */
    socket.on("user-offline", async ({ email }) => {
      if (!email) return;

      onlineEmails.delete(email);
      socket.leave(email);

      console.log(`User ${email} went OFFLINE (logout)`);

      try {
        await User.findOneAndUpdate(
          { email },
          { status: "Offline", lastActive: new Date() },
          { new: true }
        );
      } catch (err) {
        console.error("Error updating user status to Offline:", err);
      }

      io.emit("user-online-status", { email, status: "Offline" });
      broadcastOnlineEmails();
    });

    /* =======================
       3. JOIN USER ROOM 
       ======================= */
    socket.on("joinUserRoom", (userId) => {
      if (!userId) return;
      socket.join(userId);
      console.log(`User joined private room: ${userId}`);
    });

    socket.on("leaveUserRoom", (userId) => {
      if (!userId) return;
      socket.leave(userId);
      console.log(`User left private room: ${userId}`);
    });

    /* =======================
       4. PRIVATE CHAT (userId based)
       ======================= */
    socket.on("sendMessage", (message) => {
      const { receiverId } = message;
      if (!receiverId) return;

      // এখানে receiverId রুমে জয়েন করা থাকলে মেসেজ পাবে
      io.to(receiverId).emit("receiveMessage", message);
    });

    socket.on("typing", ({ senderId, receiverId }) => {
      if (receiverId) io.to(receiverId).emit("typing", { senderId });
    });

    socket.on("stopTyping", ({ receiverId }) => {
      if (receiverId) io.to(receiverId).emit("stopTyping");
    });

    socket.on("messageRead", async ({ _id: messageId, receiverId }) => {
      try {
        const updated = await Message.findByIdAndUpdate(
          messageId,
          { read: true },
          { new: true }
        );
        if (updated && receiverId) {
          io.to(receiverId).emit("messageRead", { id: messageId });
        }
      } catch (error) {
        console.error("Error marking message as read:", error);
      }
    });

    socket.on("deleteMessage", ({ messageId, receiverId }) => {
      if (messageId && receiverId) {
        io.to(receiverId).emit("messageDeleted", { messageId });
      }
    });

    /* =======================
       5. GROUP CHAT
       ======================= */
    socket.on("joinGroup", ({ groupId }) => {
      if (groupId) {
        socket.join(groupId);
        console.log(`User joined group: ${groupId}`);
      }
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
       6. BOARD STATUS UPDATE
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
          const memberId = member._id.toString();
          io.to(memberId).emit("boardStatusUpdated", updatedBoard);
        });
      } catch (err) {
        console.error("Error updating board status:", err);
      }
    });

    /* =======================
       7. DISCONNECT (auto offline)
       ======================= */
    socket.on("disconnect", async () => {
      console.log("Client disconnected:", socket.id);

      let disconnectedEmail = null;

      for (const [email, sId] of onlineEmails.entries()) {
        if (sId === socket.id) {
          disconnectedEmail = email;
          onlineEmails.delete(email);
          socket.leave(email);
          break;
        }
      }

      if (disconnectedEmail) {
        console.log(`User ${disconnectedEmail} is OFFLINE (disconnect)`);

        try {
          await User.findOneAndUpdate(
            { email: disconnectedEmail },
            { status: "Offline", lastActive: new Date() },
            { new: true }
          );
        } catch (err) {
          console.error("Error updating user status on disconnect:", err);
        }

        io.emit("user-online-status", { email: disconnectedEmail, status: "Offline" });
        broadcastOnlineEmails();
      }
    });
  });
}
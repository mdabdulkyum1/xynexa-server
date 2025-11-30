// sockets/setupSocket.js

import Board from "../models/boardModel.js";
import Message from "../models/messageModel.js";
import User from "../models/userModel.js";

export function setupSocket(io) {
  // email -> socketId
  const connectedUsers = {};

  const connectedGroups = {};

  // email -> socketId
  const onlineUsers = new Map();

  const broadcastOnlineUsers = () => {
    const users = Array.from(onlineUsers.keys()); // ["a@gmail.com", "b@gmail.com", ...]
    io.emit("online-users", users);
  };

  io.on("connection", (socket) => {
    console.log("🔌 New client connected:", socket.id);

    /* =========================
       USER JOIN / ONLINE SYSTEM
       ======================= */
    socket.on("join", async ({ email }) => {
      if (!email) return;

      // room নাম হিসেবে email ব্যবহার করছি
      socket.join(email);

      connectedUsers[email] = socket.id;
      onlineUsers.set(email, socket.id);

      console.log(`👤 User ${email} joined & is ONLINE`);

      // DB তে Online + lastActive আপডেট
      try {
        await User.findOneAndUpdate(
          { email },
          {
            status: "Online",
            lastActive: new Date(),
          },
          { new: true }
        );
      } catch (err) {
        console.error("Error updating user status to Online:", err);
      }

      io.emit("user-online-status", {
        email,
        status: "Online",
      });

      broadcastOnlineUsers();
    });

    /* =======================
       PRIVATE CHAT SOCKETS
       ======================= */

    socket.on("sendMessage", (message) => {
      const { receiverEmail, senderEmail } = message;

      if (!receiverEmail || !senderEmail) {
        console.error(
          "Invalid message data: missing receiverEmail or senderEmail"
        );
        return;
      }

      // এখন receiverId এর জায়গায় receiverEmail ধরছি
      io.to(receiverEmail).emit("receiveMessage", message);
    });

    socket.on("typing", ({ senderEmail, receiverEmail }) => {
      if (receiverEmail && senderEmail) {
        io.to(receiverEmail).emit("typing", { senderEmail });
      }
    });

    socket.on("stopTyping", ({ receiverEmail }) => {
      if (receiverEmail) {
        io.to(receiverEmail).emit("stopTyping");
      }
    });

    /* =======================
       MESSAGE READ / DELETE
       ======================= */

    socket.on("messageRead", async ({ _id: messageId, receiverEmail }) => {
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

        // যাকে পাঠাবে সে এখন email রুম এ join থাকে
        io.to(receiverEmail).emit("messageRead", { id: messageId });
      } catch (error) {
        console.error("Error updating message read status:", error);
      }
    });

    socket.on("deleteMessage", ({ messageId, receiverEmail }) => {
      if (messageId && receiverEmail) {
        io.to(receiverEmail).emit("messageDeleted", { messageId });
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

        // এখানে ধরে নিচ্ছি member model এ email আছে
        updatedBoard.members.forEach((member) => {
          const email = member.email;
          if (!email) return;

          const socketId = connectedUsers[email];
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

    socket.on("user-offline", async ({ email }) => {
      if (!email) return;

      onlineUsers.delete(email);
      delete connectedUsers[email];

      console.log(`🚪 User ${email} went OFFLINE (logout)`);

      // DB তে Offline update
      try {
        await User.findOneAndUpdate(
          { email },
          {
            status: "Offline",
            lastActive: new Date(),
          },
          { new: true }
        );
      } catch (err) {
        console.error("Error updating user status to Offline (logout):", err);
      }

      io.emit("user-online-status", {
        email,
        status: "Offline",
      });

      broadcastOnlineUsers();
    });

    /* =======================
       DISCONNECT HANDLE
       ======================= */

    socket.on("disconnect", async () => {
      console.log("🔌 Client disconnected:", socket.id);

      let disconnectedEmail = null;

      for (const [email, sId] of Object.entries(connectedUsers)) {
        if (sId === socket.id) {
          disconnectedEmail = email;
          delete connectedUsers[email];
          break;
        }
      }

      if (disconnectedEmail) {
        onlineUsers.delete(disconnectedEmail);

        console.log(`🚪 User ${disconnectedEmail} is OFFLINE (disconnect)`);

        // DB তে Offline update (auto disconnect)
        try {
          await User.findOneAndUpdate(
            { email: disconnectedEmail },
            {
              status: "Offline",
              lastActive: new Date(),
            },
            { new: true }
          );
        } catch (err) {
          console.error(
            "Error updating user status to Offline (disconnect):",
            err
          );
        }

        io.emit("user-online-status", {
          email: disconnectedEmail,
          status: "Offline",
        });

        broadcastOnlineUsers();
      }
    });
  });
}

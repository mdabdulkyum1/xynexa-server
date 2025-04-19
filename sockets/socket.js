// import { Server } from 'socket.io';
// import Board from '../models/boardModel.js'; // Import the Board model

// export function setupSocket(server) {
//   const io = new Server(server, {
//     cors: {
//       origin: process.env.CLIENT_URL || 'http://localhost:3000',
//       methods: ['GET', 'POST']
//     }
//   });

//   const connectedUsers = {};

//   io.on('connection', (socket) => {
//     console.log('🔌 New client connected');

//     socket.on('join', ({ userId }) => {
//       socket.join(userId);
//       connectedUsers[userId] = socket.id;
//       console.log(`👤 User ${userId} joined`);
//     });

//     socket.on('sendMessage', (message) => {
//       const { receiverId } = message;
//       io.to(receiverId).emit('receiveMessage', message);
//     });

//     socket.on('typing', ({ senderId, receiverId }) => {
//       io.to(receiverId).emit('typing', { senderId });
//     });

//     socket.on('stopTyping', ({ receiverId }) => {
//       io.to(receiverId).emit('stopTyping');
//     });

//     socket.on('messageRead', ({ _id, receiverId }) => {
//       io.to(receiverId).emit('messageRead', { id: _id });
//     });

//     socket.on("deleteMessage", ({ messageId, receiverId }) => {
//       socket.to(receiverId).emit("messageDeleted", { messageId });
//     });

//     // 📌 New: Update Board Task Status in Real-Time
//     socket.on('update-task-status', async ({ boardId, newStatus }) => {
//       try {
//         const updatedBoard = await Board.findByIdAndUpdate(
//           boardId,
//           { status: newStatus, updatedAt: new Date() },
//           { new: true }
//         ).populate('members comments.user attachments.user');

//         if (!updatedBoard) {
//           console.error(`❌ Board not found: ${boardId}`);
//           return;
//         }

//         // Notify all members about the update
//         updatedBoard.members.forEach(member => {
//           const socketId = connectedUsers[member._id.toString()];
//           if (socketId) {
//             io.to(socketId).emit('boardStatusUpdated', updatedBoard);
//           }
//         });

//       } catch (err) {
//         console.error('❌ Error updating board status:', err);
//       }
//     });

//     socket.on('disconnect', () => {
//       for (const [userId, sId] of Object.entries(connectedUsers)) {
//         if (sId === socket.id) {
//           delete connectedUsers[userId];
//           console.log(`🚪 User ${userId} disconnected`);
//           break;
//         }
//       }
//     });
//   });
// }












import { Server } from "socket.io";
import Board from "../models/boardModel.js"; // Import the Board model

export function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  const connectedUsers = {};

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

    socket.on("messageRead", ({ _id, receiverId }) => {
      if (_id && receiverId) {
        io.to(receiverId).emit("messageRead", { id: _id });
      }
    });

    socket.on("deleteMessage", ({ messageId, receiverId }) => {
      if (messageId && receiverId) {
        io.to(receiverId).emit("messageDeleted", { messageId });
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
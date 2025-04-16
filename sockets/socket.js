import { Server } from 'socket.io';

export function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST']
    }
  });

  const connectedUsers = {};

  io.on('connection', (socket) => {
    socket.on('join', ({ userId }) => {
      socket.join(userId);
      connectedUsers[userId] = socket.id;
    });

    socket.on('sendMessage', (message) => {
      const { receiverId } = message;
      io.to(receiverId).emit('receiveMessage', message);
    });

    socket.on('typing', ({ senderId, receiverId }) => {
      io.to(receiverId).emit('typing', { senderId });
    });

    socket.on('stopTyping', ({ receiverId }) => {
      io.to(receiverId).emit('stopTyping');
    });

    socket.on('messageRead', ({ _id, receiverId }) => {
      io.to(receiverId).emit('messageRead', { id: _id });
    });

    socket.on("deleteMessage", ({ messageId, receiverId }) => {
      // Send delete info directly to receiver
      socket.to(receiverId).emit("messageDeleted", { messageId });
    });

    socket.on('disconnect', () => {
      for (const [userId, sId] of Object.entries(connectedUsers)) {
        if (sId === socket.id) {
          delete connectedUsers[userId];
          break;
        }
      }
    });
  });
}

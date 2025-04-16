import express from 'express';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

// import routes
import userRoutes from './routes/userRoutes.js';
import teamRoutes from './routes/teamRoutes.js'; 
import messageRoutes from './routes/messageRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import boardRoutes from './routes/boardRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js'
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
    },
});

connectDB();

app.use(express.json());
app.use(cors());


io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);
  
    socket.on("join", ({ userId }) => {
      socket.join(userId);
    });
  
    socket.on("sendMessage", ({ senderId, receiverId, text: message }) => {
      io.to(receiverId).emit("receiveMessage", { senderId, text: message });
    });
  
    socket.on("typing", ({ senderId, receiverId }) => {
      io.to(receiverId).emit("typing", { senderId });
    });
  
    socket.on("stopTyping", ({ receiverId }) => {
      io.to(receiverId).emit("stopTyping");
    });

    socket.on("messageRead", ({ messageId, receiverId }) => {
        io.to(receiverId).emit("messageRead", { messageId });
      });
  
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

//ashraful

app.use("/api", userRoutes);
app.use("/api", messageRoutes);
app.use("/api/boards", boardRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/payments', paymentRoutes);      //payment route

app.post('/documents', (req, res) => {
    const newDoc = req.body;
  
})

app.get('/', (req, res) => {
    res.send('Xynexa Server is running');
});

server.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});

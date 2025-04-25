import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import http from 'http';
import cors from 'cors';

// Custom modules
import connectDB from './config/db.js';
import { setupSocket } from './sockets/socket.js';

// Routes
import userRoutes from './routes/userRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import boardRoutes from './routes/boardRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import groupMessageRoutes from './routes/groupMessageRoutes.js';

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

// Socket.IO setup
setupSocket(server);

app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
}));

// API Routes
app.use("/api", userRoutes);
app.use("/api", messageRoutes);
app.use("/api/boards", boardRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api', groupMessageRoutes);

// Root route
app.get('/', (req, res) => {
    res.send('Xynexa Server is running');
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

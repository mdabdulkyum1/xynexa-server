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

io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('message', (data) => {
        console.log('Received:', data);
        io.emit('message', data);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

app.use("/api", userRoutes);
app.use("/api", messageRoutes);
app.use('/api/teams', teamRoutes);

app.get('/', (req, res) => {
    res.send('Xynexa Server is running');
});

server.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});
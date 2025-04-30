
import axios from "axios";

export const meetSocketSetUp = (io) => {
  


const roomCodeToIdMap = {};
const roomUsers = {};


io.on("connection", (socket) => {
    console.log("Connected ID:", socket.id);

    // Create Room
    socket.on("createRoom", async (userData) => {
        // console.log("User Data:", userData);
        try {
            // 100ms room create 
            const roomResponse = await axios.post(
                "https://api.100ms.live/v2/rooms",
                {
                    name: `room-${socket.id}-${Date.now()}`,
                    description: "Dynamic room for Xynexa",
                    template_id: process.env.HMS_TEMPLATE_ID,
                },
                {
                    headers: {
                        Authorization: `Bearer ${process.env.HMS_MANAGEMENT_TOKEN}`,
                    },
                }
            );


            const roomId = roomResponse.data.id; // 100ms room id 

            // Generate room code
            const roomCodeResponse = await axios.post(
                `https://api.100ms.live/v2/room-codes/room/${roomId}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${process.env.HMS_MANAGEMENT_TOKEN}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            
            const roomCode = roomCodeResponse.data.data.find(code => code.enabled)?.code;

            
            // Store mapping of roomCode to roomId
            roomCodeToIdMap[roomCode] = roomId;

            socket.join(roomCode);
            roomUsers[roomCode] = [{ socketId: socket.id, ...userData }];
            const { name, timestamp } = userData;
            socket.emit("RoomCreated", roomCode, name, timestamp);
           

        } catch (error) {
            console.error("Error creating 100ms room:", error);
            socket.emit("RoomCreationError", "Failed to create room");
        }
    });

    // Join Room 
    socket.on("JoinRoom", async ({ roomId, userData }) => {
        try {
            // roomId here is actually the roomCode
            const actualRoomId = roomCodeToIdMap[roomId]; // Get the actual room_id

            if (!actualRoomId) {
                socket.emit("RoomJoinError", "Invalid room code");
                return;
            }

            // Check if the room exists in 100ms
            const roomResponse = await axios.get(
                `https://api.100ms.live/v2/rooms/${actualRoomId}`,
                {
                    headers: {
                        Authorization: `Bearer ${process.env.HMS_MANAGEMENT_TOKEN}`,
                    },
                }
            );

            if (!roomResponse.data.id) {
                socket.emit("RoomJoinError", "Room not found");
                return;
            }

            socket.join(roomId); // Join the socket room using roomCode
            if (!roomUsers[roomId]) {
                roomUsers[roomId] = [];
            }
            roomUsers[roomId].push({ socketId: socket.id, ...userData });
            socket.emit("RoomJoined", roomId);
            io.to(roomId).emit("updatedRoomUser", roomUsers[roomId]);
        } catch (error) {
            console.error("Error joining room:", error);
            socket.emit("RoomJoinError", "Failed to join room");
        }
    });

    socket.on("getRoomUsers", (roomId) => {
        if (roomUsers[roomId]) {
            socket.emit("updatedRoomUser", roomUsers[roomId]);
        } else {
            socket.emit("updatedRoomUser", []);
        }
    });

    // Send Message
    socket.on("sentMessage", async ({ room, message, senderName, senderEmail, photo, receiverName }) => {
        const messageData = {
            room,
            message,
            photo,
            senderName,
            senderEmail,
            receiverName,
            timestamp: new Date()
        };
        io.to(room).emit("receiveMessage", { sender: socket.id, senderName, photo, message });

        const messagesCollection = client.db("Xynexa").collection('messages');
        await messagesCollection.insertOne(messageData);
    });

    // Handle Disconnect
    socket.on("disconnect", () => {
        for (const roomId in roomUsers) {
            roomUsers[roomId] = roomUsers[roomId].filter(user => user.socketId !== socket.id);
            if (roomUsers[roomId].length === 0) {
                delete roomUsers[roomId];
                delete roomCodeToIdMap[roomId]; // Clean up mapping
            }
            io.to(roomId).emit("updatedRoomUser", roomUsers[roomId]);
        }
        console.log(`Disconnected user ID: ${socket.id}`);
    });
});











}
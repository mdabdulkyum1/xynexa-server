import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";

export const generateToken = async (req, res) => {
  try {
    const { room_id, role } = req.body;
    const user = req.auth;

    if (!room_id || !role) {
      return res.status(400).json({ error: "room_id and role are required" });
    }

    if (!process.env.HMS_APP_ID || !process.env.HMS_APP_SECRET) {
      throw new Error("HMS_APP_ID or HMS_APP_SECRET is not defined");
    }

    const payload = {
      access_key: process.env.HMS_APP_ID,
      room_id,
      user_id: user.userId,
      role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
      version: 2, // Use integer instead of string
      jti: randomUUID(),
    };

    const token = jwt.sign(payload, process.env.HMS_APP_SECRET, {
      algorithm: "HS256",
    });

    // Verify token signature
    try {
      jwt.verify(token, process.env.HMS_APP_SECRET);
      console.log("Token verification successful");
    } catch (err) {
      console.error("Token verification failed:", err);
    }

    console.log("Generated JWT Token:", token);
    console.log("Token Payload:", payload);
    res.status(200).json({ token });
  } catch (error) {
    console.error("Error generating token:", error);
    res.status(500).json({ error: "Failed to generate token" });
  }
};






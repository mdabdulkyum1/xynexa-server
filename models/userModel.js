import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    clerkId: { type: String, required: true, unique: true }, // Clerk user ID
    firstName: { type: String, required: true },
    lastName: { type: String },
    email: { type: String, required: true, unique: true },
    imageUrl: { type: String },
    role: { type: String, required: true, default: "member" }, // Default role
    status: { type: String, enum: ["Online", "Offline"], default: "Offline" }, // Track user status
    lastActive: { type: Date, default: Date.now }, // Last activity timestamp
  },
  { timestamps: true, versionKey: false }
);

const User = mongoose.model("User", userSchema);

export default User;

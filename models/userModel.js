const mongoose = require('mongoose');

// Define user schema
const userSchema = new mongoose.Schema({
  clerkId: { type: String, required: true, unique: true }, // Clerk user ID
  firstName: { type: String, required: true },
  lastName: { type: String },
  email: { type: String, required: true, unique: true },
  imageUrl: { type: String },
  role: { type: String, required: true, default: "member" } // Default role set to "member"
}, { timestamps: true, versionKey: false });

// Create Mongoose model
const User = mongoose.model('User', userSchema);

module.exports = User;

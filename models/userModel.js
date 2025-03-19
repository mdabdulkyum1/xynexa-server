const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  clerkId: { type: String, required: true, unique: true }, // Clerk user ID
  firstName: { type: String, required: true },
  lastName: { type: String },
  email: { type: String, required: true, unique: true },
  imageUrl: { type: String },
  role: { type: String, required: true }, // Role (Admin, Member, Viewer, etc.)
},
{ timestamps: true, versionKey: false }
);

const User = mongoose.model('User', userSchema);

module.exports = User;

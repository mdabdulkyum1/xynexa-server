const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  pin: { type: String, required: true },
  mobile: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['user', 'agent',], default: 'user' },
  nid: { type: String, required: true, unique: true },
  photoURL: { type: String, default: null },
  session: { type: String, default: null }, // Stores active session
  amount: { type: Number, default: 0 }, // Account balance
  isBlocked: { type: Boolean, default: false } // Admin can block a user/agent
}, { timestamps: true, versionKey: false });

const User = mongoose.model('User', userSchema);

module.exports = User;

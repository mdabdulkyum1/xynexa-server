const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  pin: { type: String, required: true },
  mobile: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['user', 'agent',], default: 'user' },
  nid: { type: String, required: true, unique: true },
  photoURL: { type: String, default: null },
  session: { type: String, default: null }, 
  amount: { type: Number, default: 0 }, 
  isBlocked: { type: Boolean, default: false } 
}, { timestamps: true, versionKey: false });

const User = mongoose.model('User', userSchema);

module.exports = User;

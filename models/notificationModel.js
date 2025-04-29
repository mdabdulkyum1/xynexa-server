// notificationModel.js
import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  name: { 
    type: String 
  }, // sender's name (optional, for fast UI rendering)
  avatar: { 
    type: String 
  }, // sender's avatar URL (optional, for fast UI rendering)
  message: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['message', 'group_message', 'team_invite', 'board_update', 'comment', 'general'], 
    default: 'general' 
  },
  link: { 
    type: String 
  }, // optional, link to related page
  isRead: { 
    type: Boolean, 
    default: false 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;

import mongoose from 'mongoose';

const GroupMessageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

const GroupMessage = mongoose.model('GroupMessage', GroupMessageSchema);
export default GroupMessage;
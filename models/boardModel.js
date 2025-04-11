import mongoose from 'mongoose';

const BoardSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    status: {
        type: String, enum: ['pending', 'in-progress', 'completed', 'backlog'], default: 'pending',
    },
    timeStrap: {
        assignDate: {
            type: Date,
            required: true,
        },
        finishDate: {
            type: Date,
            required: true,
        },
    },
    membersEmail: [
        {
            type: String,
            required: true,
        }
    ],
    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        required: true,
    },
    teamCreatorEmail: {
        type: String, required: true,
    },
});

const Board = mongoose.model('Board', BoardSchema)
export default Board;


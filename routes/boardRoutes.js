import express from 'express';
import {
    createBoard,
    getBoardById,
    updateBoard,
    deleteBoard,
    addMemberToBoard,
    addCommentToBoard,
    updateBoardStatus,
    addAttachmentToBoard,
    getBoardsByTeamId,
    getBoardsByUserEmail,
    getUserOverallAndTeamTaskSummary,
} from '../controllers/boardController.js';

const router = express.Router();

// Create a new board
router.post('/create', createBoard);

// Get a board by ID
router.get('/:id', getBoardById);

// Update a board
router.put('/:id', updateBoard);

// Delete a board
router.delete('/:id', deleteBoard);

// Add a member to a board
router.post('/members', addMemberToBoard);

// Add a comment to a board
router.post('/comments', addCommentToBoard);

// Update the status of a board
router.put('/:boardId/status', updateBoardStatus);

// Add an attachment to a board
router.post('/attachments', addAttachmentToBoard);

// Get boards by team ID
router.get('/team/:teamId', getBoardsByTeamId);
router.get('/task/email/:email', getBoardsByUserEmail);
router.get('/task/user/full-summary/:email', getUserOverallAndTeamTaskSummary);


export default router; 
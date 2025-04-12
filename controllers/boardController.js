import Board from '../models/boardModel.js';
import User from '../models/userModel.js';

// Create a new board
export const createBoard = async (req, res) => {
  try {
    const board = await Board.create(req.body);
    res.status(201).json(board);
  } catch (error) {
    console.error('Error creating board:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get a board by ID
export const getBoardById = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id).populate('members comments.user');
    if (!board) return res.status(404).json({ message: 'Board not found' });
    res.status(200).json(board);
  } catch (error) {
    console.error('Error fetching board:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Update a board
export const updateBoard = async (req, res) => {
  try {
    const board = await Board.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('members comments.user');
    if (!board) return res.status(404).json({ message: 'Board not found' });
    res.status(200).json(board);
  } catch (error) {
    console.error('Error updating board:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Delete a board
export const deleteBoard = async (req, res) => {
  try {
    const board = await Board.findByIdAndDelete(req.params.id);
    if (!board) return res.status(404).json({ message: 'Board not found' });
    res.status(200).json({ message: 'Board deleted successfully' });
  } catch (error) {
    console.error('Error deleting board:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Add a member to a board
export const addMemberToBoard = async (req, res) => {
  try {
    const { boardId, userId } = req.body;
    const board = await Board.findById(boardId);
    if (!board) return res.status(404).json({ message: 'Board not found' });

    if (!board.members.includes(userId)) {
      board.members.push(userId);
      await board.save();
      res.status(200).json(await Board.findById(boardId).populate('members comments.user'));
    } else {
      res.status(400).json({ message: 'User already in board' });
    }
  } catch (error) {
    console.error('Error adding member to board:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Add a comment to a board
export const addCommentToBoard = async (req, res) => {
  try {
    const { boardId, userId, text } = req.body;
    const board = await Board.findById(boardId);
    if (!board) return res.status(404).json({ message: 'Board not found' });

    board.comments.push({ user: userId, text });
    await board.save();
    res.status(200).json(await Board.findById(boardId).populate('members comments.user'));

  } catch (error) {
    console.error('Error adding comment to board:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Update the status of a board
export const updateBoardStatus = async (req, res) => {
  try {
    const { boardId, status } = req.body;
    const board = await Board.findByIdAndUpdate(boardId, { status }, { new: true }).populate('members comments.user');
    if (!board) return res.status(404).json({ message: 'Board not found' });
    res.status(200).json(board);
  } catch (error) {
    console.error('Error updating board status:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Add an attachment to a board
export const addAttachmentToBoard = async (req, res) => {
  try {
    const { boardId, url, filename } = req.body;
    const board = await Board.findById(boardId);
    if (!board) return res.status(404).json({ message: 'Board not found' });

    board.attachments.push({ url, filename });
    await board.save();
    res.status(200).json(await Board.findById(boardId).populate('members comments.user'));

  } catch (error) {
    console.error('Error adding attachment to board:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get boards by team ID
export const getBoardsByTeamId = async (req, res) => {
  try {
    const { teamId } = req.params;
    const boards = await Board.find({ teamId: teamId }).populate('members comments.user');

    if (!boards || boards.length === 0) {
      return res.status(404).json({ message: 'No boards found for this team' });
    }

    res.status(200).json(boards);
  } catch (error) {
    console.error('Error fetching boards by teamId:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
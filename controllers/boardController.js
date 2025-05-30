import Board from '../models/boardModel.js';
import User from '../models/userModel.js';
import Team from '../models/teamModel.js';

export const createBoard = async (req, res) => {
  try {
    const board = await Board.create(req.body);
    res.status(201).json(board);
  } catch (error) {
    console.error('Error creating board:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

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

export const addCommentToBoard = async (req, res) => {
  try {
    const { boardId, userId, text } = req.body;
    console.log(boardId,userId,text);
    
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

export const addAttachmentToBoard = async (req, res) => {
  try {
    const { boardId, userId, url, filename } = req.body;
    console.log(boardId, userId, url, filename);

    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    board.attachments.push({ user: userId, url, filename }); 
    await board.save();

    const updatedBoard = await Board.findById(boardId)
      .populate('members')
      .populate('comments.user')
      .populate('attachments.user');

    res.status(200).json(updatedBoard);

  } catch (error) {
    console.error('Error adding attachment to board:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const updateBoardStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { boardId } = req.params;
    console.log(status,boardId);
    
    const board = await Board.findByIdAndUpdate(boardId, { status }, { new: true }).populate('members comments.user');
    if (!board) return res.status(404).json({ message: 'Board not found' });
    res.status(200).json(board);
  } catch (error) {
    console.error('Error updating board status:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const getBoardsByTeamId = async (req, res) => {
  try {
    const { teamId } = req.params;
    const boards = await Board.find({ teamId: teamId }).populate('members comments.user').sort({ _id: -1 });

    if ( boards?.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(boards);
  } catch (error) {
    console.error('Error fetching boards by teamId:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};


export const getBoardsByUserEmail = async (req, res) => {
  const { email } = req.params;
  console.log(`Fetching boards for user with email: ${email}`);

  try {
   
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

   
    const boards = await Board.find({ members: user._id }).populate('members comments.user');

    res.status(200).json(boards);

  } catch (error) {
    console.error('Error fetching boards by user email:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const getUserOverallAndTeamTaskSummary = async (req, res) => {
  const { email } = req.params;
  console.log(`Fetching overall and team task summary for user with email: ${email}`);

  try {
      const user = await User.findOne({ email });
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }
      const userId = user._id;

      // Overall User Task Summary
      const userBoards = await Board.find({ members: userId });
      const overallTotalTasks = userBoards.length;
      const overallTodoTasks = userBoards.filter(board => board.status === 'todo').length;
      const overallInProgressTasks = userBoards.filter(board => board.status === 'in-progress').length;
      const overallDoneTasks = userBoards.filter(board => board.status === 'done').length;

      // Team-Specific Summary
      const teams = await Team.find({
          $or: [
              { creator: userId },
              { members: userId }
          ]
      }).populate('members');

      const teamSummaries = [];
      for (const team of teams) {
          const teamBoards = await Board.find({ teamId: team._id });
          teamSummaries.push({
              teamName: team.name,
              teamId: team._id,
              totalMembers: team.members.length,
              totalTasks: teamBoards.length,
          });
      }

      res.status(200).json({
          overallSummary: {
              totalTasks: overallTotalTasks,
              todoTasks: overallTodoTasks,
              inProgressTasks: overallInProgressTasks,
              doneTasks: overallDoneTasks,
          },
          teamSummaries: teamSummaries,
      });

  } catch (error) {
      console.error('Error fetching user overall and team task summary:', error);
      res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
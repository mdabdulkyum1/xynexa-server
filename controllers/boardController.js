import Board from "../models/boardModel.js";

// Create a new board
export const createTask = async (req, res) => {
    console.log("Creating board with data:", req.body); // Debugging line
    try {
        const {
            title,
            timeStrap,
            status,
            membersEmail,
            teamId,
            teamCreatorEmail
        } = req.body;

        const newBoard = new Board({
            title,
            timeStrap,
            status,
            membersEmail,
            teamId,
            teamCreatorEmail
        });

        const savedBoard = await newBoard.save();
        res.status(201).json({
            success: true,
            message: "Board created successfully",
            savedBoard
        });
    } catch (error) {
        console.error('Error creating board:', error);
        res.status(500).json({ message: 'Server error' });
    }
};



// Get all tasks/boards by teamId or memberEmail
export const getAllTasksBy = async (req, res) => {
    const { teamId } = req.query;

    try {
        // Build the query to filter by teamId or memberEmail
        let query = {};

        if (teamId) {
            query.teamId = teamId;
        }
        // Fetch boards matching the query and populate related Team data
        const tasks = await Board.find(query)
            .populate('teamId')
            .sort({ 'timeStrap.assignDate': -1 });  // Sorting by assignDate

        res.status(200).json({
            success: true,
            tasks,
        });

    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

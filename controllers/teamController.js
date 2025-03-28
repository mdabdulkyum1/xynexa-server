import Team from '../models/teamModel.js';
import User from '../models/userModel.js'; 

// Create a team
export const createTeam = async (req, res) => {
    try {
        const { name, description, type, creator } = req.body; // Creator ID from request body

        const team = new Team({
            name,
            description,
            type,
            creator,
            members: [creator], // Creator is added as the first member
        });

        await team.save();

        res.status(201).json({ message: 'Team created successfully', team });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get a team by ID
export const getTeam = async (req, res) => {
    try {
        const team = await Team.findById(req.params.id).populate('creator').populate('members');
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }
        res.status(200).json(team);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};


// Get user's teams (ID from params)
export const getUserTeams = async (req, res) => {
    try {
        const userId = req.params.userId; // User ID from params
        const teams = await Team.find({ members: userId }).populate('creator').populate('members');
        res.status(200).json(teams);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};


// Update a team
export const updateTeam = async (req, res) => {
    try {
        const team = await Team.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }
        res.status(200).json({ message: 'Team updated successfully', team });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Delete a team
export const deleteTeam = async (req, res) => {
    try {
        const team = await Team.findByIdAndDelete(req.params.id);
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }
        res.status(200).json({ message: 'Team deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Add a member to a team
export const addMemberToTeam = async (req, res) => {
    try {
        const { teamId, memberEmail } = req.body;

        const team = await Team.findById(teamId);
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        const member = await User.findOne({ email: memberEmail });
        if (!member) {
            return res.status(404).json({ message: 'Member not found' });
        }

        if (team.members.includes(member._id)) {
            return res.status(400).json({ message: 'Member already in team' });
        }

        team.members.push(member._id);
        await team.save();

        res.status(200).json({ message: 'Member added to team successfully', team });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};


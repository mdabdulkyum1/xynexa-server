import Team from '../models/teamModel.js';
import User from '../models/userModel.js'; 
 
// Create a team

export const createTeam = async (req, res) => {
    try {
        const team = await Team.create({
            name: req.body.teamName,
            description: req.body.teamDescription,
            type: req.body.teamType,
            creator: req.body.creator,
        });
        res.status(201).json(team);
    } catch (error) {
        console.error("Error creating team:", error); 
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};


export const getUserTeams = async (req, res) => {
    try {
        const userId = req.params.userId;

        const teams = await Team.find({
            $or: [
                { creator: userId },
                { members: userId }
            ]
        })
        .populate('creator')
        .populate('members')
        .sort({ _id: -1 });;

        res.status(200).json(teams);
    } catch (error) {
        console.error("Error fetching user teams:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
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


// // Get user's teams (ID from params)
// export const getUserTeams = async (req, res) => {
//     try {
//         const userId = req.params.userId; // User ID from params
//         const teams = await Team.find({ members: userId }).populate('creator').populate('members');
//         res.status(200).json(teams);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Server Error' });
//     }
// };


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

export const getUserTeamsByEmail = async (req, res) => {
    try {
        const userEmail = req.params.userEmail;

        const user = await User.findOne({ email: userEmail });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const userId = user._id;

        const teams = await Team.find({
            $or: [
                { creator: userId },
                { members: userId }
            ]
        })
        .sort({ _id: -1 });

        const formattedTeams = teams.map(team => ({
            title: team.name,

            url:`/dashboard/tasks/${team._id}`

        }));

        res.status(200).json(formattedTeams);
    } catch (error) {
        console.error("Error fetching user teams:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};
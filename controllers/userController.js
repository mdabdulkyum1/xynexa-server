import Team from '../models/teamModel.js';
import User from '../models/userModel.js'; // Import User model

// Register User (Set Online by Default)
export const registerUser = async (req, res) => {
  
    try {
        const { clerkId, firstName, lastName, email, imageUrl } = req.body;

        // Validate required fields
        if (!clerkId || !email) {
            return res.status(400).json({ message: "Clerk ID and Email are required!" });
        }

        // Check if user already exists by clerkId or email
        const existingUser = await User.findOne({ $or: [{ clerkId }, { email }] });

        if (existingUser) {
            const errorMessage = existingUser.clerkId === clerkId
                ? "User already exists with this Clerk ID"
                : "User already exists with this Email";

            return res.status(400).json({ message: errorMessage });
        }

        // Create new user
        const newUser = new User({
            clerkId,
            firstName,
            lastName,
            email,
            imageUrl,
            role: "member",
            status: "Online", 
            lastActive: new Date(),
        });

       
        await newUser.save();

        return res.status(201).json({ message: "User registered successfully", user: newUser });
    } catch (error) {
        console.error("Error registering user:", error);

        
        if (error.code === 11000) {
            return res.status(400).json({ message: `Duplicate key error: ${JSON.stringify(error.keyValue)}` });
        }

        return res.status(500).json({ message: "Server error. Please try again later." });
    }
};


// User Login (Set Online)
export const loginUser = async (req, res) => {
  try {
    const { clerkId } = req.body;
    // Find user and update status to Online
    const user = await User.findOneAndUpdate(
      { clerkId },
      { status: "Online", lastActive: new Date() },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "User logged in", user });
  } catch (error) {
    console.error("Error logging in:", error);
    return res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// User Logout (Set Offline)
export const logoutUser = async (req, res) => {
  try {
    const { clerkId } = req.body;

    const user = await User.findOneAndUpdate(
      { clerkId },
      { status: "Offline", lastActive: new Date() },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "User logged out", user });
  } catch (error) {
    console.error("Error logging out:", error);
    return res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// Get Online Users
export const getOnlineUsers = async (req, res) => {
  try {
    const { userEmail: email } = req.params;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required in params',
      });
    }

    // Get current user's _id
    const currentUser = await User.findOne({ email });
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Find teams where this user is a member
    const teams = await Team.find({ members: currentUser._id })
      .populate('members', 'clerkId email firstName lastName imageUrl status lastActive');

    // Extract all members from these teams
    const allMembers = teams.flatMap(team => team.members);

    // Remove duplicates using user _id
    const uniqueMembersMap = new Map();
    allMembers.forEach(member => {
      uniqueMembersMap.set(member._id.toString(), member);
    });

    const uniqueMembers = Array.from(uniqueMembersMap.values());

    // return res.status(200).json({
    //   success: true,
    //   members: uniqueMembers,
    // });

    return res.status(200).json({ uniqueMembers });

  } catch (error) {
    console.error("Error fetching team members:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};



// Get User by ID
export  const getUserById = async (req, res) => {
  try {
    const user = await User.findOne({ clerkId: req.params.id });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).json({ message: "Server error. Please try again later." });
  }
}

// **Get All Users**
export const getAllUsers = async (req, res) => {
  try {
      const users = await User.find(); // Fetch all users
      return res.status(200).json({ users });
  } catch (error) {
      console.error("Error fetching all users:", error);
      return res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// **Get User by Email**
export const getUserByEmail = async (req, res) => {
  try {
      const { email } = req.params;
      const user = await User.findOne({ email: email });

      if (!user) {
          return res.status(404).json({ message: "User not found with this email" });
      }

      return res.status(200).json({ user });
  } catch (error) {
      console.error("Error fetching user by email:", error);
      return res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// get user by email for free payment
export const updateUserPackageByEmail = async (req, res) => {
  try {
    const { _id, packageName } = req.body;

    const updatedUser = await User.findOneAndUpdate(
      { _id },
      { package: packageName },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: `Package updated to ${packageName}`,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating package:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
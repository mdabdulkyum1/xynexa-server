const User = require("../models/userModel");

// Register User (Set Online by Default)
const registerUser = async (req, res) => {
  try {
    const { clerkId, firstName, lastName, email, imageUrl } = req.body;

    // Validate required fields
    if (!clerkId || !email) {
      return res.status(400).json({ message: "Clerk ID and Email are required!" });
    }

    // Check if user already exists
    let user = await User.findOne({ clerkId });

    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create and Save New User
    user = new User({
      clerkId,
      firstName,
      lastName,
      email,
      imageUrl,
      role: "member",
      status: "Online", // Set user to Online upon registration
      lastActive: new Date(),
    });

    await user.save();

    return res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    console.error("Error registering user:", error);
    return res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// User Login (Set Online)
const loginUser = async (req, res) => {
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
const logoutUser = async (req, res) => {
  try {
    const { clerkId } = req.body;

    // Find user and update status to Offline
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
const getOnlineUsers = async (req, res) => {
  try {
    const onlineUsers = await User.find({ status: "Online" });

    return res.status(200).json({ onlineUsers });
  } catch (error) {
    console.error("Error fetching online users:", error);
    return res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// Get User by ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).json({ message: "Server error. Please try again later." });
  }
}

module.exports = { registerUser, loginUser, logoutUser, getOnlineUsers, getUserById };

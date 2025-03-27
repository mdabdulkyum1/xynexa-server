import User from '../models/userModel.js';

const registerUser = async (req, res) => {
    try {
        const { clerkId, firstName, lastName, email, imageUrl } = req.body;

        // Validate required fields
        if (!clerkId || !email) {
            return res.status(400).json({ message: "Clerk ID and Email are required!" });
        }

        // Check if user already exists (by clerkId or email)
        const existingUser = await User.findOne({ $or: [{ clerkId }, { email }] });

        if (existingUser) {
            if (existingUser.clerkId === clerkId) {
                return res.status(400).json({ message: "User already exists with this Clerk ID" });
            }
            if (existingUser.email === email) {
                return res.status(400).json({ message: "User already exists with this Email" });
            }
        }

        // Create new user
        const newUser = new User({
            clerkId,
            firstName,
            lastName,
            email,
            imageUrl,
            role: "member",
        });

        // Save user to the database
        await newUser.save();

        return res.status(201).json({ message: "User registered successfully", user: newUser });
    } catch (error) {
        console.error("Error registering user:", error);

        // Handle MongoDB duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({ message: `Duplicate key error: ${JSON.stringify(error.keyValue)}` });
        }

        return res.status(500).json({ message: "Server error. Please try again later." });
    }
};

export { registerUser };
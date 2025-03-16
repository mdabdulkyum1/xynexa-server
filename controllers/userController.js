
const { v4: uuidv4 } = require('uuid'); 
const User = require('../models/userModel');
const Admin = require("../models/adminModel");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const registerUser = async (req, res) => {
    try {
        const { name, pin, mobile, email, role, nid, photoURL, session } = req.body;

        // Check if the mobile number or email is already registered
        const existingUser = await User.findOne({ $or: [{ mobile }, { email }] });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User with this mobile number or email already exists",
            });
        }

        // Hash the PIN
        const hashedPassword = await bcrypt.hash(pin, 10);

        // Create a new user with a 40 Taka bonus
        const newUser = new User({
            name,
            pin: hashedPassword, // Store hashed pin
            mobile,
            email,
            role,
            nid,
            photoURL,
            session,
            amount: 40,
        });

        // Save user to the database
        const newUserInfo = await newUser.save();

        res.status(201).json({
            success: true,
            message: "User registered successfully with 40 Taka bonus",
            data: newUserInfo,
        });

    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({
            success: false,
            message: "User registration failed",
            error: error.message,
        });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, pin, mobile } = req.body;

        // Check if user exists in User or Admin collection
        let user = await User.findOne({ email }) || await User.findOne({ mobile });
  
        let role = "user"; // Default role

        if (!user) {
            user = await Admin.findOne({ email }) || await Admin.findOne({ mobile });
            if (user) role = user.role; // If found in Admin collection, assign role as "admin"
        }

        // If user is not found in either collection
        if (!user || !(await bcrypt.compare(pin, user.pin))) {
            return res.status(400).json({
                success: false,
                message: "Invalid login credentials",
            });
        }

        // Generate session using UUID
        const sessionToken = uuidv4(); 

        // Update user session in the database
        user.session = sessionToken;
        await user.save();

        // Generate JWT token including user ID, session, and role
        const token = jwt.sign(
            { id: user._id, session: sessionToken, role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRED || "7d" }
        );

        // Send the response with user/admin data
        return res.status(200).json({
            success: true,
            message: `user logged in successfully`,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role, // Include role in response
                session: sessionToken, 
                token, 
            },
        });

    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({
            success: false,
            message: "Login failed",
            error: error.message,
        });
    }
};

const logoutUser = async (req, res) => {
    try {
        const { id } = req.user; // Extract user ID from request (provided by `verifySession` middleware)

        // Check if the user exists in either Users or Admins collection
        let user = await User.findById(id);
        let role = "user"; // Default role

        if (!user) {
            user = await Admin.findById(id);
            if (user) role = "admin"; // If found in Admin collection, set role
        }

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Clear session/token
        user.session = null;
        await user.save();

        return res.status(200).json({
            success: true,
            message: `${role.charAt(0).toUpperCase() + role.slice(1)} logged out successfully`,
        });

    } catch (error) {
        console.error("Logout error:", error);
        return res.status(500).json({
            success: false,
            message: "Error logging out",
            error: error.message,
        });
    }
};






module.exports = {
    registerUser,
    loginUser,
    logoutUser
};
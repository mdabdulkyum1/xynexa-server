const User = require('../models/userModel');

const registerUser = async (req, res) => {

        try {
          const { clerkId, firstName, lastName, email, imageUrl } = req.body;
          console.log("test email>>>", email)
      
          if (!clerkId || !email) {
            return res.status(400).json({ message: "Missing required fields" });
          }
      
          const user = new User({
            clerkId,
            firstName,
            lastName,
            email,
            imageUrl,
            role: "member",
          });
      
          await user.save();
          return res.status(201).json({ message: "User registered successfully" });
        } catch (error) {
          console.error(error);
          return res.status(500).json({ message: "Server error" });
        }
   
};

// const loginUser = async (req, res) => {
//     try {
//         const { email, pin, mobile } = req.body;

//         // Check if user exists in User or Admin collection
//         let user = await User.findOne({ email }) || await User.findOne({ mobile });
  
//         let role = "user"; // Default role

//         if (!user) {
//             user = await Admin.findOne({ email }) || await Admin.findOne({ mobile });
//             if (user) role = user.role; // If found in Admin collection, assign role as "admin"
//         }

//         // If user is not found in either collection
//         if (!user || !(await bcrypt.compare(pin, user.pin))) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid login credentials",
//             });
//         }

//         // Generate session using UUID
//         const sessionToken = uuidv4(); 

//         // Update user session in the database
//         user.session = sessionToken;
//         await user.save();

//         // Generate JWT token including user ID, session, and role
//         const token = jwt.sign(
//             { id: user._id, session: sessionToken, role },
//             process.env.JWT_SECRET,
//             { expiresIn: process.env.JWT_EXPIRED || "7d" }
//         );

//         // Send the response with user/admin data
//         return res.status(200).json({
//             success: true,
//             message: `user logged in successfully`,
//             data: {
//                 id: user._id,
//                 name: user.name,
//                 email: user.email,
//                 role, // Include role in response
//                 session: sessionToken, 
//                 token, 
//             },
//         });

//     } catch (error) {
//         console.error("Login Error:", error);
//         return res.status(500).json({
//             success: false,
//             message: "Login failed",
//             error: error.message,
//         });
//     }
// };

// const logoutUser = async (req, res) => {
//     try {
//         const { id } = req.user; // Extract user ID from request (provided by `verifySession` middleware)

//         // Check if the user exists in either Users or Admins collection
//         let user = await User.findById(id);
//         let role = "user"; // Default role

//         if (!user) {
//             user = await Admin.findById(id);
//             if (user) role = "admin"; // If found in Admin collection, set role
//         }

//         if (!user) {
//             return res.status(404).json({ success: false, message: "User not found" });
//         }

//         // Clear session/token
//         user.session = null;
//         await user.save();

//         return res.status(200).json({
//             success: true,
//             message: `${role.charAt(0).toUpperCase() + role.slice(1)} logged out successfully`,
//         });

//     } catch (error) {
//         console.error("Logout error:", error);
//         return res.status(500).json({
//             success: false,
//             message: "Error logging out",
//             error: error.message,
//         });
//     }
// };






module.exports = {
    registerUser,
};

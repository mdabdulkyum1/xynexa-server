import express from 'express';
import { registerUser, getOnlineUsers, getUserById, getAllUsers, getUserByEmail, logoutUser } from '../controllers/userController.js'; 

const router = express.Router();

router.post('/register', registerUser);
router.get('/online/users', getOnlineUsers);
router.get('/users/:id', getUserById);
router.get('/users', getAllUsers); // Route to get all users
router.get('/users/email/:email', getUserByEmail); // Route to get user by ema
router.patch('/logout', logoutUser);

export default router; 
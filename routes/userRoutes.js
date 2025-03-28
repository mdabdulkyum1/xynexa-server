import express from 'express';
import { registerUser, getOnlineUsers, getUserById } from '../controllers/userController.js'; 

const router = express.Router();

router.post('/register', registerUser);
router.get('/online/users', getOnlineUsers);
router.get('/users/:id', getUserById);

export default router;
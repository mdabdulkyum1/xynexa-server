const express = require('express');
const { registerUser, getOnlineUsers, getUserById } = require('../controllers/userController');

import express from 'express';
import { registerUser } from '../controllers/userController.js'; 

const router = express.Router();

router.post('/register', registerUser);
router.get('/online/users', getOnlineUsers);
router.get('/users/:id', getUserById);

export default router;
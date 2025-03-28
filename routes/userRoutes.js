const express = require('express');
const { registerUser, getOnlineUsers, getUserById } = require('../controllers/userController');


const router = express.Router();

router.post('/register', registerUser);
router.get('/online/users', getOnlineUsers);
router.get('/users/:id', getUserById);


module.exports = router;

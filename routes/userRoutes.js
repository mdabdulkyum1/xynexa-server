const express = require('express');
const { registerUser, loginUser, logoutUser } = require('../controllers/userController');
const { getUser, getAllUsers, getAdmin } = require('../controllers/getUser');


const router = express.Router();
const verifySession = require('../middlewares/verifySessionMid'); 


router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', verifySession, logoutUser);


router.get("/auth/me", verifySession, getUser); 
router.get("/users", verifySession, getAllUsers); 
router.get("/users/role/:email", verifySession, getAdmin); 



module.exports = router;

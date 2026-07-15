import express from 'express';
import { 
  registerUser, 
  loginUser, 
  logoutUser, 
  getUserProfile 
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Register and Login routes are public
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

// Profile endpoint is private, guarded by protect middleware
router.get('/me', protect, getUserProfile);

export default router;

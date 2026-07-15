import express from 'express';
import { chatWithAssistant } from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/ai/chat
router.post('/', protect, chatWithAssistant);

export default router;

import express from 'express';
import { analyzeResume } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Map POST /api/ai/analyze
router.post('/analyze', protect, upload.single('resume'), analyzeResume);

export default router;

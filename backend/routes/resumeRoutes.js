import express from 'express';
import { 
  uploadResume, 
  getResumes, 
  deleteResume, 
  toggleActiveResume 
} from '../controllers/resumeController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// All resume operations require authentication
router.use(protect);

// Map routes
router.post('/', upload.single('resume'), uploadResume); // Single file upload mapped to key 'resume'
router.get('/', getResumes);
router.delete('/:id', deleteResume);
router.patch('/:id/active', toggleActiveResume);

export default router;

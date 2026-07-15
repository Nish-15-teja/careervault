import express from 'express';
import { 
  createApplication, 
  getApplications, 
  updateApplication, 
  deleteApplication 
} from '../controllers/applicationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All tracker routes are private and require authorization
router.use(protect);

// Map routes
router.post('/', createApplication);
router.get('/', getApplications);
router.put('/:id', updateApplication);
router.delete('/:id', deleteApplication);

export default router;

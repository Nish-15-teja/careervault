import express from 'express';
import { 
  addCertificate, 
  getCertificates, 
  deleteCertificate 
} from '../controllers/certificateController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// All certificate routes are guarded by auth middleware
router.use(protect);

// Map routes
router.post('/', upload.single('certificate'), addCertificate); // Accepts file attachment with field name 'certificate'
router.get('/', getCertificates);
router.delete('/:id', deleteCertificate);

export default router;

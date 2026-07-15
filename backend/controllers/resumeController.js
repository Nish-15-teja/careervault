import Resume from '../models/Resume.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';

// @desc    Upload a new resume PDF
// @route   POST /api/resumes
// @access  Private
export const uploadResume = async (req, res) => {
  const { title } = req.body;

  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Validation Error: No resume PDF file attached' });
    }

    if (!title) {
      return res.status(400).json({ message: 'Validation Error: Please provide a title for this resume version' });
    }

    // Call Cloudinary / Local upload wrapper
    const uploadResult = await uploadToCloudinary(req.file.path);

    // If this is the user's first resume upload, make it active by default
    const resumeCount = await Resume.countDocuments({ userId: req.user._id });
    const isActive = resumeCount === 0;

    const resume = await Resume.create({
      userId: req.user._id,
      title,
      fileUrl: uploadResult.secure_url,
      cloudinaryPublicId: uploadResult.public_id,
      isActive
    });

    res.status(201).json(resume);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all resumes of the logged-in user
// @route   GET /api/resumes
// @access  Private
export const getResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(resumes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a resume
// @route   DELETE /api/resumes/:id
// @access  Private
export const deleteResume = async (req, res) => {
  const { id } = req.params;

  try {
    const resume = await Resume.findOne({ _id: id, userId: req.user._id });
    
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found or unauthorized' });
    }

    // Delete media file from Cloudinary (or local uploads)
    await deleteFromCloudinary(resume.cloudinaryPublicId);

    // Delete document record from database
    await Resume.deleteOne({ _id: id });

    // UX refinement: If we deleted the active resume, auto-promote the next newest one to active
    if (resume.isActive) {
      const nextResume = await Resume.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
      if (nextResume) {
        nextResume.isActive = true;
        await nextResume.save();
      }
    }

    res.status(200).json({ message: 'Resume deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Set a resume as active
// @route   PATCH /api/resumes/:id/active
// @access  Private
export const toggleActiveResume = async (req, res) => {
  const { id } = req.params;

  try {
    const targetResume = await Resume.findOne({ _id: id, userId: req.user._id });
    
    if (!targetResume) {
      return res.status(404).json({ message: 'Resume not found or unauthorized' });
    }

    // Step 1: Set all user's resumes to inactive
    await Resume.updateMany({ userId: req.user._id }, { isActive: false });

    // Step 2: Make the targeted one active
    targetResume.isActive = true;
    await targetResume.save();

    res.status(200).json({ message: 'Active resume toggled successfully', targetResume });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

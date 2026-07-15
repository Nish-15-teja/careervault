import Certificate from '../models/Certificate.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';

// @desc    Add a new certificate
// @route   POST /api/certificates
// @access  Private
export const addCertificate = async (req, res) => {
  const { title, issuer, issueDate, credentialId, verificationUrl } = req.body;

  try {
    if (!title || !issuer || !issueDate) {
      return res.status(400).json({ message: 'Validation Error: Please provide title, issuer, and issueDate' });
    }

    let fileUrl = '';
    let cloudinaryPublicId = '';

    // If an image or PDF proof was attached
    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.path);
      fileUrl = uploadResult.secure_url;
      cloudinaryPublicId = uploadResult.public_id;
    }

    const certificate = await Certificate.create({
      userId: req.user._id,
      title,
      issuer,
      issueDate: new Date(issueDate),
      credentialId: credentialId || '',
      verificationUrl: verificationUrl || '',
      fileUrl,
      cloudinaryPublicId
    });

    res.status(201).json(certificate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all certificates of the logged-in user
// @route   GET /api/certificates
// @access  Private
export const getCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find({ userId: req.user._id }).sort({ issueDate: -1 });
    res.status(200).json(certificates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a certificate
// @route   DELETE /api/certificates/:id
// @access  Private
export const deleteCertificate = async (req, res) => {
  const { id } = req.params;

  try {
    const certificate = await Certificate.findOne({ _id: id, userId: req.user._id });

    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found or unauthorized' });
    }

    // Clean up file asset if attached
    if (certificate.cloudinaryPublicId) {
      await deleteFromCloudinary(certificate.cloudinaryPublicId);
    }

    await Certificate.deleteOne({ _id: id });
    res.status(200).json({ message: 'Certificate deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

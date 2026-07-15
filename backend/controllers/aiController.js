import fs from 'fs';
import { extractTextFromPdf, analyzeResumeWithAI } from '../utils/aiHelper.js';

// @desc    Analyze resume text against job description
// @route   POST /api/ai/analyze
// @access  Private
export const analyzeResume = async (req, res) => {
  const { jobDescription } = req.body;

  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Validation Error: Please upload your resume PDF' });
    }

    if (!jobDescription) {
      // Clean up uploaded file before returning error
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ message: 'Validation Error: Please paste a target Job Description' });
    }

    // Step 1: Extract text content from PDF
    const resumeText = await extractTextFromPdf(req.file.path);

    // Step 2: Feed resume text and JD to Gemini / Local Fallback
    const analysisReport = await analyzeResumeWithAI(resumeText, jobDescription);

    // Step 3: Delete temporary PDF file from disk storage to save space
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    // Step 4: Return compiled structured JSON response
    res.status(200).json(analysisReport);
  } catch (error) {
    // Ensure clean up if error occurs mid-process
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Analysis routing error:', error);
    res.status(500).json({ message: `Analysis failed: ${error.message}` });
  }
};

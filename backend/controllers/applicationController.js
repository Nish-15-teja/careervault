import Application from '../models/Application.js';

// @desc    Track a new job application
// @route   POST /api/applications
// @access  Private
export const createApplication = async (req, res) => {
  const { companyName, role, status, salary, jobDescriptionUrl, notes, appliedDate, resumeId, assessmentDate } = req.body;

  try {
    if (!companyName || !role) {
      return res.status(400).json({ message: 'Validation Error: Company name and Role are required' });
    }

    const application = await Application.create({
      userId: req.user._id,
      companyName,
      role,
      status: status || 'Applied',
      salary: salary || null,
      jobDescriptionUrl: jobDescriptionUrl || '',
      notes: notes || '',
      appliedDate: appliedDate ? new Date(appliedDate) : Date.now(),
      resumeId: resumeId || null,
      assessmentDate: assessmentDate ? new Date(assessmentDate) : null
    });

    const populatedApp = await Application.findById(application._id).populate('resumeId', 'title fileUrl');
    res.status(201).json(populatedApp);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all job trackers of the user
// @route   GET /api/applications
// @access  Private
export const getApplications = async (req, res) => {
  try {
    const applications = await Application.find({ userId: req.user._id })
      .populate('resumeId', 'title fileUrl')
      .sort({ appliedDate: -1 });
    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update application details or column status
// @route   PUT /api/applications/:id
// @access  Private
export const updateApplication = async (req, res) => {
  const { id } = req.params;
  const { companyName, role, status, salary, jobDescriptionUrl, notes, appliedDate, resumeId, assessmentDate } = req.body;

  try {
    const application = await Application.findOne({ _id: id, userId: req.user._id });

    if (!application) {
      return res.status(404).json({ message: 'Application tracker not found or unauthorized' });
    }

    // Assign changes
    if (companyName) application.companyName = companyName;
    if (role) application.role = role;
    if (status) application.status = status;
    if (salary !== undefined) application.salary = salary;
    if (jobDescriptionUrl !== undefined) application.jobDescriptionUrl = jobDescriptionUrl;
    if (notes !== undefined) application.notes = notes;
    if (appliedDate) application.appliedDate = new Date(appliedDate);
    if (resumeId !== undefined) application.resumeId = resumeId || null;
    if (assessmentDate !== undefined) application.assessmentDate = assessmentDate ? new Date(assessmentDate) : null;

    await application.save();
    
    const populatedApp = await Application.findById(application._id).populate('resumeId', 'title fileUrl');
    res.status(200).json(populatedApp);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a tracked job application
// @route   DELETE /api/applications/:id
// @access  Private
export const deleteApplication = async (req, res) => {
  const { id } = req.params;

  try {
    const application = await Application.findOne({ _id: id, userId: req.user._id });

    if (!application) {
      return res.status(404).json({ message: 'Application tracker not found or unauthorized' });
    }

    await Application.deleteOne({ _id: id });
    res.status(200).json({ message: 'Application tracker deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

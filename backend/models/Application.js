import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    companyName: {
      type: String,
      required: [true, 'Please add a company name'],
      trim: true
    },
    role: {
      type: String,
      required: [true, 'Please add a job role'],
      trim: true
    },
    status: {
      type: String,
      required: true,
      enum: ['Applied', 'OA', 'Interviewing', 'Offered', 'Rejected'],
      default: 'Applied'
    },
    salary: {
      type: Number,
      default: null
    },
    jobDescriptionUrl: {
      type: String,
      trim: true,
      default: ''
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    },
    appliedDate: {
      type: Date,
      default: Date.now
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      default: null
    },
    assessmentDate: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

const Application = mongoose.model('Application', applicationSchema);
export default Application;

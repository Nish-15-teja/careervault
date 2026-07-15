import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Please add a certificate title'],
      trim: true
    },
    issuer: {
      type: String,
      required: [true, 'Please add the issuing organization'],
      trim: true
    },
    issueDate: {
      type: Date,
      required: [true, 'Please add the date of issue']
    },
    credentialId: {
      type: String,
      trim: true,
      default: ''
    },
    verificationUrl: {
      type: String,
      trim: true,
      default: ''
    },
    fileUrl: {
      type: String,
      default: ''
    },
    cloudinaryPublicId: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

const Certificate = mongoose.model('Certificate', certificateSchema);
export default Certificate;

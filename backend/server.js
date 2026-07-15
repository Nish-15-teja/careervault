import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import resumeRoutes from './routes/resumeRoutes.js';
import certificateRoutes from './routes/certificateRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import chatRoutes from './routes/chatRoutes.js';

// Load environment configurations
dotenv.config();

// Connect to MongoDB Database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration: Whitelist React app and Chrome Extension origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://careervault-phi.vercel.app'
];
app.use(
  cors({
    origin: function (origin, callback) {
      if (
        !origin || 
        allowedOrigins.includes(origin) || 
        origin.endsWith('.vercel.app') || 
        origin.startsWith('chrome-extension://')
      ) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
  })
);

// Body Parser middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser middleware (allows req.cookies.jwt)
app.use(cookieParser());

// Serve local uploaded resume PDFs statically from the uploads folder
app.use('/uploads', express.static('uploads'));

// Base check endpoint
app.get('/', (req, res) => {
  res.send('CareerVault AI API Server is running...');
});

// Auth API routing endpoints mapping
app.use('/api/auth', authRoutes);

// Resume Vault API routing endpoints mapping
app.use('/api/resumes', resumeRoutes);

// Certificate Vault API routing endpoints mapping
app.use('/api/certificates', certificateRoutes);

// Placement Application Tracker API routing endpoints mapping
app.use('/api/applications', applicationRoutes);

// AI Assistant & Analyzer API routing endpoints mapping
app.use('/api/ai', aiRoutes);

// AI Career Chat Assistant API routing endpoints mapping
app.use('/api/chat', chatRoutes);

// Error Handling Middleware for uncaught routes
app.use((req, res, next) => {
  res.status(404).json({ message: `API Endpoint Not Found: ${req.originalUrl}` });
});

// Global server crash error handling catcher
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

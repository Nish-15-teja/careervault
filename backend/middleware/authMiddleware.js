import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Middleware to protect private endpoints
export const protect = async (req, res, next) => {
  let token;

  // Read the JWT token from the HTTP-Only cookie OR Authorization header
  if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      // Verify token signature using JWT secret
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch user profile and exclude the password hash field
      req.user = await User.findById(decoded.userId).select('-password');

      next(); // Pass control to the next handler
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token validation failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no session token found' });
  }
};

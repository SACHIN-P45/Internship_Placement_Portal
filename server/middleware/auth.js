// JWT authentication middleware — verifies token & attaches user to req
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    let token;

    // Check for Bearer token in Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request (exclude password)
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (req.user.isBlocked) {
      return res
        .status(403)
        .json({ message: 'Your account has been blocked by the admin' });
    }

    // Update lastActive timestamp (fire-and-forget, max once per minute)
    const now = new Date();
    if (!req.user.lastActive || now - req.user.lastActive > 60000) {
      User.updateOne({ _id: req.user._id }, { lastActive: now }).catch(() => {});
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, token invalid' });
  }
};

module.exports = protect;

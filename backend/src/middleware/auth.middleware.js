import User from '../models/User.js';
import { verifyToken } from '../utils/token.js';
import { sendError } from '../utils/response.js';

/**
 * Protect routes: verify JWT from HTTP-only cookie or Bearer header
 */
export const protect = async (req, res, next) => {
  try {
    let token = null;

    // 1. Check HTTP-only cookie first
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    // 2. Fallback to Authorization header if provided
    else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return sendError(res, 'Authentication required. Please log in to proceed.', 401);
    }

    // Verify token
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      return sendError(res, 'Invalid or expired session. Please log in again.', 401);
    }

    // Find user by ID
    const user = await User.findById(decoded.id);
    if (!user) {
      return sendError(res, 'User account associated with this session no longer exists.', 401);
    }

    // Check if account has been suspended by admin
    if (user.isSuspended) {
      return sendError(res, 'Your account has been suspended. Please contact support.', 403);
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Authorize specific roles (e.g., 'admin')
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return sendError(
        res,
        `Role (${req.user?.role || 'anonymous'}) is not authorized to access this resource`,
        403
      );
    }
    next();
  };
};

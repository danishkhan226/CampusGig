import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'campusgig_super_secret_dev_jwt_key_2026_change_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const COOKIE_EXPIRES_DAYS = 7;

/**
 * Generate a signed JWT token
 */
export const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
};

/**
 * Verify JWT token
 */
export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

/**
 * Configure cookie options
 */
export const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true, // Prevents XSS script access
    secure: isProduction, // HTTPS only in production
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: COOKIE_EXPIRES_DAYS * 24 * 60 * 60 * 1000 // 7 days in milliseconds
  };
};

/**
 * Set HTTP-only cookie and return sanitized user data
 */
export const sendTokenResponse = (res, user, statusCode = 200, message = 'Success') => {
  const token = generateToken({ id: user._id, role: user.role });
  const cookieOptions = getCookieOptions();

  res.cookie('token', token, cookieOptions);

  const sanitizedUser = {
    _id: user._id,
    name: user.name,
    email: user.email,
    collegeName: user.collegeName,
    collegeEmail: user.collegeEmail,
    profileImage: user.profileImage,
    bio: user.bio,
    skills: user.skills,
    education: user.education,
    portfolioLinks: user.portfolioLinks,
    isVerifiedStudent: user.isVerifiedStudent,
    rating: user.rating,
    totalReviews: user.totalReviews,
    completedOrders: user.completedOrders,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };

  return res.status(statusCode).json({
    success: true,
    message,
    data: {
      user: sanitizedUser
    }
  });
};

/**
 * Clear the auth cookie on logout
 */
export const clearTokenCookie = (res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('token', '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    expires: new Date(0)
  });
};

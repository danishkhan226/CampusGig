import crypto from 'crypto';
import User from '../models/User.js';

/**
 * Get user profile by ID
 */
export const getUserById = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  return user;
};

/**
 * Update user profile details
 */
export const updateUserProfile = async (userId, data) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const { name, collegeName, bio, skills, education, portfolioLinks } = data;

  if (name !== undefined) {
    if (!name.trim()) {
      const error = new Error('Name cannot be empty');
      error.statusCode = 400;
      throw error;
    }
    user.name = name.trim();
  }

  if (collegeName !== undefined) {
    if (!collegeName.trim()) {
      const error = new Error('College name cannot be empty');
      error.statusCode = 400;
      throw error;
    }
    user.collegeName = collegeName.trim();
  }

  if (bio !== undefined) {
    if (bio.length > 500) {
      const error = new Error('Bio cannot exceed 500 characters');
      error.statusCode = 400;
      throw error;
    }
    user.bio = bio.trim();
  }

  if (education !== undefined) {
    user.education = education.trim();
  }

  if (skills !== undefined) {
    if (!Array.isArray(skills)) {
      const error = new Error('Skills must be an array of strings');
      error.statusCode = 400;
      throw error;
    }
    // Deduplicate and trim skills
    const cleanedSkills = Array.from(
      new Set(
        skills
          .filter((s) => typeof s === 'string' && s.trim().length > 0)
          .map((s) => s.trim())
      )
    );
    user.skills = cleanedSkills;
  }

  if (portfolioLinks !== undefined) {
    if (!Array.isArray(portfolioLinks)) {
      const error = new Error('Portfolio links must be an array');
      error.statusCode = 400;
      throw error;
    }
    // Filter and sanitize links
    const cleanedLinks = portfolioLinks
      .filter((link) => typeof link === 'string' && link.trim().length > 0)
      .map((link) => link.trim());
    user.portfolioLinks = cleanedLinks;
  }

  await user.save();
  return user;
};

/**
 * Update user profile picture / avatar
 */
export const updateUserAvatar = async (userId, profileImage) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  user.profileImage = profileImage ? profileImage.trim() : '';
  await user.save();
  return user;
};

/**
 * Initiate student verification by generating a verification OTP
 */
export const requestStudentVerification = async (userId, collegeEmail) => {
  if (!collegeEmail) {
    const error = new Error('Please provide an official university or college email address');
    error.statusCode = 400;
    throw error;
  }

  const normalizedEmail = collegeEmail.toLowerCase().trim();
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/;
  if (!emailRegex.test(normalizedEmail)) {
    const error = new Error('Please provide a valid email format for your college email');
    error.statusCode = 400;
    throw error;
  }

  // Check if another user is already verified with this college email
  const existingVerified = await User.findOne({
    _id: { $ne: userId },
    collegeEmail: normalizedEmail,
    isVerifiedStudent: true
  });

  if (existingVerified) {
    const error = new Error('This college email has already been verified by another student account');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  // Generate 6-digit numeric OTP code
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Hash OTP and store with 15-minute expiration
  const hashedOtp = crypto
    .createHash('sha256')
    .update(otp)
    .digest('hex');

  user.studentVerificationCode = hashedOtp;
  user.studentVerificationExpire = Date.now() + 15 * 60 * 1000;
  user.collegeEmail = normalizedEmail;

  await user.save({ validateBeforeSave: false });

  return {
    collegeEmail: normalizedEmail,
    verificationCode: otp,
    expiresInMinutes: 15,
    message: 'Verification code generated successfully'
  };
};

/**
 * Confirm student verification with the submitted OTP
 */
export const confirmStudentVerification = async (userId, code) => {
  if (!code) {
    const error = new Error('Please provide the 6-digit verification code');
    error.statusCode = 400;
    throw error;
  }

  const cleanCode = code.toString().trim();
  const hashedCode = crypto
    .createHash('sha256')
    .update(cleanCode)
    .digest('hex');

  const user = await User.findOne({
    _id: userId,
    studentVerificationCode: hashedCode,
    studentVerificationExpire: { $gt: Date.now() }
  });

  if (!user) {
    const error = new Error('Invalid or expired student verification code');
    error.statusCode = 400;
    throw error;
  }

  user.isVerifiedStudent = true;
  user.studentVerificationCode = undefined;
  user.studentVerificationExpire = undefined;

  await user.save();
  return user;
};

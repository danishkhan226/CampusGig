import crypto from 'crypto';
import User from '../models/User.js';

/**
 * Register a new user
 */
export const registerUser = async ({ name, email, password, confirmPassword, collegeName }) => {
  // 1. Validation
  if (!name || !email || !password || !collegeName) {
    const error = new Error('Please provide name, email, password, and college name');
    error.statusCode = 400;
    throw error;
  }

  if (password !== confirmPassword) {
    const error = new Error('Passwords do not match');
    error.statusCode = 400;
    throw error;
  }

  if (password.length < 6) {
    const error = new Error('Password must be at least 6 characters long');
    error.statusCode = 400;
    throw error;
  }

  // 2. Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
  if (existingUser) {
    const error = new Error('An account with this email address already exists');
    error.statusCode = 400;
    throw error;
  }

  // 3. Create user (password is automatically hashed by pre-save hook)
  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,
    collegeName: collegeName.trim()
  });

  return user;
};

/**
 * Login user
 */
export const loginUser = async ({ email, password }) => {
  if (!email || !password) {
    const error = new Error('Please provide both email and password');
    error.statusCode = 400;
    throw error;
  }

  // Find user and explicitly select password
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
  if (!user) {
    const error = new Error('Invalid email or password credentials');
    error.statusCode = 401;
    throw error;
  }

  // Check password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error('Invalid email or password credentials');
    error.statusCode = 401;
    throw error;
  }

  return user;
};

/**
 * Get current user profile by ID
 */
export const getCurrentUserProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  return user;
};

/**
 * Generate password reset token
 */
export const generateResetToken = async (email) => {
  if (!email) {
    const error = new Error('Please provide your registered email address');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    const error = new Error('No user found with that email address');
    error.statusCode = 404;
    throw error;
  }

  // Generate random reset token
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Hash token and store in user model with 15 minute expiry
  user.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 mins

  await user.save({ validateBeforeSave: false });

  return { user, resetToken };
};

/**
 * Reset password using token
 */
export const resetUserPassword = async ({ token, password, confirmPassword }) => {
  if (!token) {
    const error = new Error('Invalid or missing password reset token');
    error.statusCode = 400;
    throw error;
  }

  if (!password || !confirmPassword) {
    const error = new Error('Please provide both password and password confirmation');
    error.statusCode = 400;
    throw error;
  }

  if (password !== confirmPassword) {
    const error = new Error('Passwords do not match');
    error.statusCode = 400;
    throw error;
  }

  if (password.length < 6) {
    const error = new Error('Password must be at least 6 characters long');
    error.statusCode = 400;
    throw error;
  }

  // Hash the incoming token to match what's stored in the DB
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    const error = new Error('Password reset token is invalid or has expired');
    error.statusCode = 400;
    throw error;
  }

  // Update password and clear reset fields
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  return user;
};

import * as authService from '../services/auth.service.js';
import { sendTokenResponse, clearTokenCookie } from '../utils/token.js';
import { sendSuccess } from '../utils/response.js';

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user, issue HTTP-only cookie, and return user profile
 * @access  Public
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword, collegeName } = req.body;
    const user = await authService.registerUser({
      name,
      email,
      password,
      confirmPassword,
      collegeName
    });

    return sendTokenResponse(res, user, 201, 'Account successfully created');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user, set HTTP-only cookie, and return profile
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await authService.loginUser({ email, password });

    return sendTokenResponse(res, user, 200, 'Login successful');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/logout
 * @desc    Clear auth cookie and terminate session
 * @access  Public
 */
export const logout = async (req, res, next) => {
  try {
    clearTokenCookie(res);
    return sendSuccess(res, null, 200, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get currently authenticated user's profile
 * @access  Private
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await authService.getCurrentUserProfile(req.user._id);
    return sendSuccess(res, { user }, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Generate password reset token
 * @access  Public
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const { resetToken } = await authService.generateResetToken(email);

    // In production, an email would be dispatched.
    // For local development and verification, we include the reset token and sample URL in response.
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

    return sendSuccess(
      res,
      {
        resetToken,
        resetUrl,
        instruction: 'Password reset token generated. Use this token or link to set a new password within 15 minutes.'
      },
      200,
      'Password reset instructions generated'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/reset-password or POST /api/auth/reset-password/:token
 * @desc    Reset password with verified token
 * @access  Public
 */
export const resetPassword = async (req, res, next) => {
  try {
    // Support token from URL params or request body
    const token = req.params.token || req.body.token;
    const { password, confirmPassword } = req.body;

    const user = await authService.resetUserPassword({
      token,
      password,
      confirmPassword
    });

    return sendTokenResponse(res, user, 200, 'Password successfully reset and session started');
  } catch (error) {
    next(error);
  }
};

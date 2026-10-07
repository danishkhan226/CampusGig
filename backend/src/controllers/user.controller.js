import * as userService from '../services/user.service.js';
import { sendSuccess } from '../utils/response.js';

/**
 * @route   GET /api/users/:id
 * @desc    Get user profile by ID
 * @access  Public
 */
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    return sendSuccess(res, { user }, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/users/profile
 * @desc    Update current authenticated user's profile details
 * @access  Private
 */
export const updateProfile = async (req, res, next) => {
  try {
    const updatedUser = await userService.updateUserProfile(req.user._id, req.body);
    return sendSuccess(res, { user: updatedUser }, 200, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/users/avatar
 * @desc    Update profile picture
 * @access  Private
 */
export const updateAvatar = async (req, res, next) => {
  try {
    const { profileImage } = req.body;
    const updatedUser = await userService.updateUserAvatar(req.user._id, profileImage);
    return sendSuccess(res, { user: updatedUser }, 200, 'Avatar updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/users/verify-student/request
 * @desc    Request college email verification code
 * @access  Private
 */
export const requestVerification = async (req, res, next) => {
  try {
    const { collegeEmail } = req.body;
    const result = await userService.requestStudentVerification(req.user._id, collegeEmail);
    return sendSuccess(res, result, 200, 'Verification code sent to college email');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/users/verify-student/confirm
 * @desc    Confirm student verification code
 * @access  Private
 */
export const confirmVerification = async (req, res, next) => {
  try {
    const { code } = req.body;
    const updatedUser = await userService.confirmStudentVerification(req.user._id, code);
    return sendSuccess(
      res,
      { user: updatedUser },
      200,
      'Congratulations! Your student identity has been verified 🎓'
    );
  } catch (error) {
    next(error);
  }
};

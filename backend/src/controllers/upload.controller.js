import { sendSuccess, sendError } from '../utils/response.js';
import * as uploadService from '../services/upload.service.js';
import User from '../models/User.js';

// POST /api/upload/avatar
export const uploadAvatar = async (req, res) => {
  try {
     if (!req.file) {
      return sendError(res, 'No image file uploaded', 400);
    }

    const uploaded = await uploadService.uploadToImageKit(
      req.file.buffer,
      req.file.originalname,
      'avatars'
    );

    // Automatically update the user profile image in DB
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profileImage: uploaded.url },
      { new: true }
    ).select('-password');

    return sendSuccess(
      res,
      { url: uploaded.url, user },
      'Avatar uploaded and updated successfully'
    );
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

// POST /api/upload/service-images
export const uploadServiceImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return sendError(res, 'No image files uploaded', 400);
    }

    const results = await uploadService.uploadMultipleToImageKit(req.files, 'services');
    const urls = results.map((r) => r.url);

    return sendSuccess(res, { urls, files: results }, 'Service images uploaded successfully');
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

// POST /api/upload/delivery-files
export const uploadDeliveryFiles = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return sendError(res, 'No files uploaded', 400);
    }

    const results = await uploadService.uploadMultipleToImageKit(req.files, 'deliveries');
    const urls = results.map((r) => r.url);

    return sendSuccess(res, { urls, files: results }, 'Delivery files uploaded successfully');
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

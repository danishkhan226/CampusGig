import * as serviceService from '../services/service.service.js';
import { sendSuccess } from '../utils/response.js';

/**
 * @route   GET /api/services
 * @desc    Get all active services with search, filtering, and pagination
 * @access  Public
 */
export const getAllServices = async (req, res, next) => {
  try {
    const result = await serviceService.getServices(req.query);
    return sendSuccess(res, result, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/services/:id
 * @desc    Get single service detail with seller info and similar gigs
 * @access  Public
 */
export const getServiceDetails = async (req, res, next) => {
  try {
    const result = await serviceService.getServiceById(req.params.id);
    return sendSuccess(res, result, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/services
 * @desc    Create a new freelance service
 * @access  Private
 */
export const createService = async (req, res, next) => {
  try {
    const service = await serviceService.createService(req.user._id, req.body);
    return sendSuccess(res, { service }, 201, 'Service created successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/services/:id
 * @desc    Update service listing (restricted to seller owner)
 * @access  Private
 */
export const updateService = async (req, res, next) => {
  try {
    const service = await serviceService.updateService(req.params.id, req.user._id, req.body);
    return sendSuccess(res, { service }, 200, 'Service updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/services/:id
 * @desc    Delete service listing (restricted to seller owner)
 * @access  Private
 */
export const deleteService = async (req, res, next) => {
  try {
    const result = await serviceService.deleteService(req.params.id, req.user._id);
    return sendSuccess(res, result, 200, 'Service deleted successfully');
  } catch (error) {
    next(error);
  }
};

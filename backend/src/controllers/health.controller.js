import * as healthService from '../services/health.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const checkHealth = async (req, res, next) => {
  try {
    const healthData = await healthService.getSystemHealth();
    return sendSuccess(res, healthData, 200, 'CampusGig API is operational');
  } catch (error) {
    next(error);
  }
};

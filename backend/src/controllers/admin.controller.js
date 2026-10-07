import * as adminService from '../services/admin.service.js';

export const getAnalyticsOverview = async (req, res, next) => {
  try {
    const data = await adminService.getAnalyticsOverview();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const data = await adminService.getUsers(req.query);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const toggleUserVerification = async (req, res, next) => {
  try {
    const user = await adminService.toggleUserVerification(req.params.id);
    return res.status(200).json({
      success: true,
      message: `User student verification status updated to ${user.isVerifiedStudent}`,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const user = await adminService.updateUserRole(req.params.id, role);
    return res.status(200).json({
      success: true,
      message: `User role updated to ${user.role}`,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

export const toggleUserSuspension = async (req, res, next) => {
  try {
    const user = await adminService.toggleUserSuspension(req.params.id);
    return res.status(200).json({
      success: true,
      message: `User suspension status updated to ${user.isSuspended}`,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

export const getServices = async (req, res, next) => {
  try {
    const data = await adminService.getServices(req.query);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const toggleServiceStatus = async (req, res, next) => {
  try {
    const service = await adminService.toggleServiceStatus(req.params.id);
    return res.status(200).json({
      success: true,
      message: `Service status updated to ${service.isActive ? 'Active' : 'Disabled'}`,
      data: { service }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteService = async (req, res, next) => {
  try {
    await adminService.deleteService(req.params.id);
    return res.status(200).json({
      success: true,
      message: 'Service gig removed by admin'
    });
  } catch (error) {
    next(error);
  }
};

export const getOrders = async (req, res, next) => {
  try {
    const data = await adminService.getOrders(req.query);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const resolveOrderDispute = async (req, res, next) => {
  try {
    const { resolution, reason } = req.body;
    const order = await adminService.resolveOrderDispute(req.params.id, {
      resolution,
      reason
    });
    return res.status(200).json({
      success: true,
      message: `Order dispute resolved with: ${resolution}`,
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

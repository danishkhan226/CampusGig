import mongoose from 'mongoose';
import Service from '../models/Service.js';
import User from '../models/User.js';

const CATEGORY_DEFAULT_IMAGES = {
  Development: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
  Design: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=800&q=80',
  Writing: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80',
  Video: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80',
  Marketing: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
  'Academic Projects': 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
  Data: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
  Other: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80'
};

/**
 * Get all services with multi-criteria filtering, search, sorting, and pagination
 */
export const getServices = async (queryParams = {}) => {
  const {
    search,
    category,
    minPrice,
    maxPrice,
    minRating,
    maxDeliveryDays,
    verifiedOnly,
    sellerId,
    sort = 'newest',
    page = 1,
    limit = 12
  } = queryParams;

  const query = { isActive: true };

  // Filter by Seller
  if (sellerId) {
    if (mongoose.Types.ObjectId.isValid(sellerId)) {
      query.sellerId = sellerId;
    }
  }

  // Filter by Category
  if (category && category.toLowerCase() !== 'all') {
    query.category = { $regex: new RegExp(`^${category}$`, 'i') };
  }

  // Filter by Price range
  if (minPrice !== undefined || maxPrice !== undefined) {
    query.price = {};
    if (minPrice !== undefined && minPrice !== '') {
      query.price.$gte = Number(minPrice);
    }
    if (maxPrice !== undefined && maxPrice !== '') {
      query.price.$lte = Number(maxPrice);
    }
  }

  // Filter by Min Rating
  if (minRating !== undefined && minRating !== '') {
    query.rating = { $gte: Number(minRating) };
  }

  // Filter by Max Delivery Duration
  if (maxDeliveryDays !== undefined && maxDeliveryDays !== '') {
    query.deliveryDays = { $lte: Number(maxDeliveryDays) };
  }

  // Filter by Student Verification
  if (verifiedOnly === 'true' || verifiedOnly === true) {
    const verifiedUsers = await User.find({ isVerifiedStudent: true }).select('_id');
    const verifiedUserIds = verifiedUsers.map((u) => u._id);
    query.sellerId = { $in: verifiedUserIds };
  }

  // Search by title, description, skills, or freelancer name
  if (search && search.trim()) {
    const cleanSearch = search.trim();
    const searchRegex = new RegExp(cleanSearch, 'i');

    // Find users whose name matches search term
    const matchedUsers = await User.find({ name: searchRegex }).select('_id');
    const matchedUserIds = matchedUsers.map((u) => u._id);

    const searchConditions = [
      { title: searchRegex },
      { description: searchRegex },
      { skills: { $in: [searchRegex] } }
    ];

    if (matchedUserIds.length > 0) {
      searchConditions.push({ sellerId: { $in: matchedUserIds } });
    }

    if (query.$or) {
      query.$and = [{ $or: query.$or }, { $or: searchConditions }];
      delete query.$or;
    } else {
      query.$or = searchConditions;
    }
  }

  // Sorting
  let sortOption = { createdAt: -1 };
  if (sort === 'price_asc') {
    sortOption = { price: 1 };
  } else if (sort === 'price_desc') {
    sortOption = { price: -1 };
  } else if (sort === 'rating_desc') {
    sortOption = { rating: -1, reviewCount: -1 };
  } else if (sort === 'popular') {
    sortOption = { ordersCount: -1, views: -1 };
  } else if (sort === 'newest') {
    sortOption = { createdAt: -1 };
  }

  // Pagination calculation
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
  const skip = (pageNum - 1) * limitNum;

  const totalServices = await Service.countDocuments(query);
  const services = await Service.find(query)
    .populate('sellerId', 'name profileImage collegeName isVerifiedStudent rating totalReviews')
    .sort(sortOption)
    .skip(skip)
    .limit(limitNum)
    .lean();

  return {
    services,
    totalServices,
    page: pageNum,
    totalPages: Math.ceil(totalServices / limitNum) || 1,
    limit: limitNum
  };
};

/**
 * Get service details by ID with seller info and similar gigs
 */
export const getServiceById = async (serviceId) => {
  if (!mongoose.Types.ObjectId.isValid(serviceId)) {
    const error = new Error('Invalid service ID');
    error.statusCode = 400;
    throw error;
  }

  // Fetch and increment view count atomically
  const service = await Service.findByIdAndUpdate(
    serviceId,
    { $inc: { views: 1 } },
    { new: true }
  ).populate('sellerId', 'name profileImage collegeName collegeEmail isVerifiedStudent rating totalReviews completedOrders bio skills createdAt');

  if (!service) {
    const error = new Error('Service not found');
    error.statusCode = 404;
    throw error;
  }

  // Fetch similar services in the same category
  const similarServices = await Service.find({
    category: service.category,
    _id: { $ne: service._id },
    isActive: true
  })
    .populate('sellerId', 'name profileImage collegeName isVerifiedStudent rating totalReviews')
    .limit(4)
    .lean();

  return {
    service,
    similarServices
  };
};

/**
 * Create a new service listing
 */
export const createService = async (sellerId, data) => {
  const { title, description, category, skills, price, deliveryDays, images, requirements } = data;

  if (!title || !description || !category || !price || !deliveryDays) {
    const error = new Error('Please fill all required gig fields (title, description, category, price, deliveryDays)');
    error.statusCode = 400;
    throw error;
  }

  if (title.trim().length < 5 || title.trim().length > 120) {
    const error = new Error('Title must be between 5 and 120 characters');
    error.statusCode = 400;
    throw error;
  }

  if (description.trim().length < 20) {
    const error = new Error('Description must be at least 20 characters long');
    error.statusCode = 400;
    throw error;
  }

  const numPrice = Number(price);
  if (isNaN(numPrice) || numPrice < 50) {
    const error = new Error('Price must be a valid amount of at least ₹50');
    error.statusCode = 400;
    throw error;
  }

  const numDelivery = Number(deliveryDays);
  if (isNaN(numDelivery) || numDelivery < 1 || numDelivery > 90) {
    const error = new Error('Delivery days must be between 1 and 90 days');
    error.statusCode = 400;
    throw error;
  }

  // Clean skills
  let cleanedSkills = [];
  if (Array.isArray(skills)) {
    cleanedSkills = Array.from(
      new Set(
        skills
          .filter((s) => typeof s === 'string' && s.trim().length > 0)
          .map((s) => s.trim())
      )
    );
  }

  // Clean images or provide default
  let cleanedImages = [];
  if (Array.isArray(images) && images.length > 0) {
    cleanedImages = images.filter((img) => typeof img === 'string' && img.trim().length > 0);
  }
  if (cleanedImages.length === 0) {
    cleanedImages = [CATEGORY_DEFAULT_IMAGES[category] || CATEGORY_DEFAULT_IMAGES.Development];
  }

  const service = await Service.create({
    sellerId,
    title: title.trim(),
    description: description.trim(),
    category,
    skills: cleanedSkills,
    price: numPrice,
    deliveryDays: numDelivery,
    images: cleanedImages,
    requirements: requirements ? requirements.trim() : '',
    isActive: true
  });

  return await service.populate('sellerId', 'name profileImage collegeName isVerifiedStudent rating totalReviews');
};

/**
 * Update an existing service listing (enforcing ownership)
 */
export const updateService = async (serviceId, sellerId, updateData) => {
  if (!mongoose.Types.ObjectId.isValid(serviceId)) {
    const error = new Error('Invalid service ID');
    error.statusCode = 400;
    throw error;
  }

  const service = await Service.findById(serviceId);
  if (!service) {
    const error = new Error('Service not found');
    error.statusCode = 404;
    throw error;
  }

  // Ownership verification check
  if (service.sellerId.toString() !== sellerId.toString()) {
    const error = new Error('Unauthorized: You can only edit your own services');
    error.statusCode = 403;
    throw error;
  }

  const { title, description, category, skills, price, deliveryDays, images, requirements, isActive } = updateData;

  if (title !== undefined) {
    if (title.trim().length < 5 || title.trim().length > 120) {
      const error = new Error('Title must be between 5 and 120 characters');
      error.statusCode = 400;
      throw error;
    }
    service.title = title.trim();
  }

  if (description !== undefined) {
    if (description.trim().length < 20) {
      const error = new Error('Description must be at least 20 characters long');
      error.statusCode = 400;
      throw error;
    }
    service.description = description.trim();
  }

  if (category !== undefined) {
    service.category = category;
  }

  if (price !== undefined) {
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice < 50) {
      const error = new Error('Price must be at least ₹50');
      error.statusCode = 400;
      throw error;
    }
    service.price = numPrice;
  }

  if (deliveryDays !== undefined) {
    const numDelivery = Number(deliveryDays);
    if (isNaN(numDelivery) || numDelivery < 1 || numDelivery > 90) {
      const error = new Error('Delivery days must be between 1 and 90');
      error.statusCode = 400;
      throw error;
    }
    service.deliveryDays = numDelivery;
  }

  if (skills !== undefined && Array.isArray(skills)) {
    service.skills = Array.from(
      new Set(
        skills
          .filter((s) => typeof s === 'string' && s.trim().length > 0)
          .map((s) => s.trim())
      )
    );
  }

  if (images !== undefined && Array.isArray(images) && images.length > 0) {
    service.images = images.filter((img) => typeof img === 'string' && img.trim().length > 0);
  }

  if (requirements !== undefined) {
    service.requirements = requirements.trim();
  }

  if (isActive !== undefined) {
    service.isActive = Boolean(isActive);
  }

  await service.save();
  return await service.populate('sellerId', 'name profileImage collegeName isVerifiedStudent rating totalReviews');
};

/**
 * Delete a service listing (enforcing ownership)
 */
export const deleteService = async (serviceId, sellerId) => {
  if (!mongoose.Types.ObjectId.isValid(serviceId)) {
    const error = new Error('Invalid service ID');
    error.statusCode = 400;
    throw error;
  }

  const service = await Service.findById(serviceId);
  if (!service) {
    const error = new Error('Service not found');
    error.statusCode = 404;
    throw error;
  }

  // Ownership verification check
  if (service.sellerId.toString() !== sellerId.toString()) {
    const error = new Error('Unauthorized: You can only delete your own services');
    error.statusCode = 403;
    throw error;
  }

  await service.deleteOne();
  return { message: 'Service removed successfully' };
};

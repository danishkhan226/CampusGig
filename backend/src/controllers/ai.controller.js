import * as aiService from '../services/ai.service.js';

export const generateGigDescription = async (req, res, next) => {
  try {
    const { title, category, skills, targetPrice } = req.body;

    if (!title || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title and category are required to generate gig description'
      });
    }

    const data = await aiService.generateGigDescription({
      title,
      category,
      skills,
      targetPrice
    });

    return res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

export const enhanceRequirements = async (req, res, next) => {
  try {
    const { rawRequirements, gigTitle, category } = req.body;

    if (!rawRequirements) {
      return res.status(400).json({
        success: false,
        message: 'Requirements text is required'
      });
    }

    const data = await aiService.enhanceRequirements({
      rawRequirements,
      gigTitle,
      category
    });

    return res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

export const generateChatSuggestions = async (req, res, next) => {
  try {
    const { lastMessage, senderRole } = req.body;

    const data = await aiService.generateChatSuggestions({
      lastMessage,
      senderRole
    });

    return res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

export const enhanceBio = async (req, res, next) => {
  try {
    const { bio, skills, collegeName } = req.body;

    const data = await aiService.enhanceBio({
      bio,
      skills,
      collegeName
    });

    return res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

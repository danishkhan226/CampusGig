import api from './api.js';

// POST /api/ai/gig-description — generate professional gig description
export const generateGigDescription = ({ title, category, skills, targetPrice }) =>
  api.post('/ai/gig-description', { title, category, skills, targetPrice });

// POST /api/ai/enhance-requirements — structure client project requirements
export const enhanceRequirements = ({ rawRequirements, gigTitle, category }) =>
  api.post('/ai/enhance-requirements', { rawRequirements, gigTitle, category });

// POST /api/ai/chat-suggestions — get contextual quick replies in chat
export const generateChatSuggestions = ({ lastMessage, senderRole }) =>
  api.post('/ai/chat-suggestions', { lastMessage, senderRole });

// POST /api/ai/enhance-bio — polish student freelancer bio
export const enhanceBio = ({ bio, skills, collegeName }) =>
  api.post('/ai/enhance-bio', { bio, skills, collegeName });

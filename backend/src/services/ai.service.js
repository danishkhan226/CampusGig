import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
let genAI = null;
if (apiKey) {
  genAI = new GoogleGenerativeAI(apiKey);
}

const getModel = () => {
  if (!genAI) return null;
  return genAI.getGenerativeModel({ model: 'gemini-3.5-flash-lite' });
};

/**
 * 1. AI Gig Description Generator
 */
export const generateGigDescription = async ({ title, category, skills = [], targetPrice }) => {
  const model = getModel();

  if (model) {
    try {
      const prompt = `
You are an expert copywriter helping college students sell freelance services on "CampusGig", a peer-to-peer student marketplace.
Gig Title: "${title}"
Category: "${category}"
Skills/Tech Stack: "${skills.join(', ')}"
Price: ₹${targetPrice || 'negotiable'}

Write a compelling, professional, and friendly gig description (around 150-250 words). Include:
1. A catchy opening explaining what the student client will get.
2. 3-4 bullet points of deliverables.
3. Why hire this student peer (fast communication, student-friendly rates, university project expertise).

Respond ONLY with valid JSON in this format:
{
  "description": "...",
  "suggestedRequirements": "..."
}
`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      return {
        description: parsed.description,
        suggestedRequirements: parsed.suggestedRequirements || 'Please provide your project goals, references, and deadline.',
        isAI: true
      };
    } catch (err) {
      console.warn('[Gemini AI] API call failed, falling back to smart template generator:', err.message);
    }
  }

  // Graceful smart template fallback
  const skillsList = skills.length > 0 ? skills.join(', ') : 'professional tools';
  const description = `Looking for high-quality ${category.toLowerCase()} work without corporate agency costs? I specialize in ${title.toLowerCase()} for university peers and campus projects.

What You Get:
• Complete, custom delivery tailored to your project guidelines
• Built with industry best practices using ${skillsList}
• Fast turnaround with direct peer-to-peer collaboration
• Unlimited communication and revisions until you're completely satisfied

Why Work With Me:
As a fellow student, I understand tight deadlines, academic standards, and budget constraints. Let's collaborate and bring your ideas to life!`;

  const suggestedRequirements = `To get started, please share:
1. Brief overview of your project requirements and objectives.
2. Any reference links, design samples, or files.
3. Your expected timeline or submission date.`;

  return {
    description,
    suggestedRequirements,
    isAI: false
  };
};

/**
 * 2. AI Proposal / Order Requirements Enhancer
 */
export const enhanceRequirements = async ({ rawRequirements, gigTitle, category }) => {
  const model = getModel();

  if (model && rawRequirements) {
    try {
      const prompt = `
A student buyer is placing an order for the gig: "${gigTitle}" (${category}).
Here is their rough draft of requirements:
"${rawRequirements}"

Please refine and structure this into a clear, professional project brief (under 180 words) with:
- Project Goal & Scope
- Key Deliverables
- Timeline / Expectations

Format nicely with clean text and bullet points. Do not include markdown codeblocks.
`;

      const result = await model.generateContent(prompt);
      return {
        enhancedRequirements: result.response.text().trim(),
        isAI: true
      };
    } catch (err) {
      console.warn('[Gemini AI] Requirements enhance failed, using template:', err.message);
    }
  }

  // Fallback enhancement
  const enhancedRequirements = `Project Objective:
${rawRequirements}

Key Deliverables:
• Complete project source files and final output
• Documentation / setup instructions as agreed upon
• Clean and formatted results according to guidelines

Timeline & Expectations:
• Clear milestone communication and final review before order completion.`;

  return {
    enhancedRequirements,
    isAI: false
  };
};

/**
 * 3. AI Chat Quick Reply Suggestions
 */
export const generateChatSuggestions = async ({ lastMessage, senderRole = 'seller' }) => {
  const model = getModel();

  if (model && lastMessage) {
    try {
      const prompt = `
A student on CampusGig just received this message in peer chat:
"${lastMessage}"

Role of receiver: ${senderRole} (student ${senderRole}).

Suggest 3 concise, friendly, and professional quick replies (max 10-15 words each).
Respond ONLY with a JSON array of 3 strings, e.g.:
["Sounds good, I'll review and get back shortly!", "Could you share the project files?", "Thanks! I'm on it."]
`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return { suggestions: parsed.slice(0, 3), isAI: true };
      }
    } catch (err) {
      console.warn('[Gemini AI] Chat suggestions failed, using template:', err.message);
    }
  }

  // Fallback contextual suggestions
  const defaultSuggestions = senderRole === 'seller'
    ? [
        "Thanks! I've started working on this.",
        "Could you please share any reference files or links?",
        "Sounds great, I'll send you an update shortly!"
      ]
    : [
        "Looks great, thank you for the update!",
        "Could we make a small revision on this?",
        "Thank you! Everything looks good."
      ];

  return {
    suggestions: defaultSuggestions,
    isAI: false
  };
};

/**
 * 4. AI Profile Bio & Skills Improver
 */
export const enhanceBio = async ({ bio, skills = [], collegeName }) => {
  const model = getModel();

  if (model) {
    try {
      const prompt = `
A college student at ${collegeName || 'university'} wants to improve their freelancer profile bio on CampusGig.
Current Bio: "${bio || 'Student developer looking for projects.'}"
Skills: "${skills.join(', ')}"

Write an engaging, trustworthy, and professional bio. It MUST be strictly under 500 characters (not words — characters). Highlight technical skills, problem-solving passion, and student work ethic. Keep it concise and punchy.
Return ONLY plain text. No hashtags, no quotes.
`;

      const result = await model.generateContent(prompt);
      return {
        enhancedBio: result.response.text().trim().slice(0, 500),
        isAI: true
      };
    } catch (err) {
      console.warn('[Gemini AI] Bio enhance failed, using template:', err.message);
    }
  }

  const skillsText = skills.length > 0 ? ` specializing in ${skills.slice(0, 3).join(', ')}` : '';
  const enhancedBio = `Passionate student freelancer at ${collegeName || 'university'}${skillsText}. I build clean, reliable, and high-impact solutions for campus peers and client projects. Dedicated to fast turnaround, clear communication, and delivering top-tier quality every time.`;

  return {
    enhancedBio,
    isAI: false
  };
};

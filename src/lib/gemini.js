import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from '@google/generative-ai';

import { GEMINI_API_KEY, GEMINI_MODEL } from '$env/static/private';

const DEFAULT_SAFETY_SETTINGS = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
  },
];

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const modelInstance = genAI.getGenerativeModel({
  model: GEMINI_MODEL,
  safetySettings: DEFAULT_SAFETY_SETTINGS,
});

/**
 * Generate content / chat
 * @param {String} prompt - prompt to generate content.
 * @returns {String} - The generated content.
 */
async function generateContent(prompt) {
  const { response } = await modelInstance.generateContent(prompt);
  return response.text();
}

export { generateContent };

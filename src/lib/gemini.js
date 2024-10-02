import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from '@google/generative-ai';

import { GEMINI_API_KEYS, GEMINI_MODEL } from '$env/static/private';

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

/**
 * Generate content / chat
 * @param {String} prompt - prompt to generate content.
 * @param {Number} attempt - number of retry attempts
 * @param {Number} apiKeyIndex - used api key index
 * @returns {String} - The generated content.
 */
async function generateContent(prompt, attempt = 0, apiKeyIndex = 0) {
  const apiKeys = GEMINI_API_KEYS.split(',').map((key) => key.trim());
  const maxAttempts = apiKeys.length;

  const genAI = new GoogleGenerativeAI(apiKeys[apiKeyIndex]);
  const modelInstance = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    safetySettings: DEFAULT_SAFETY_SETTINGS,
  });

  try {
    const { response } = await modelInstance.generateContent(prompt);
    return response.text();
  } catch (err) {
    if (err?.status === 429 && attempt < maxAttempts) {
      console.warn(
        `[generateContent] API rate limit hit, retrying with another key.. (Attempt: ${
          attempt + 1
        }/${maxAttempts})`
      );

      /** round-robin(?) */
      const nextApiKeyIndex = (apiKeyIndex + 1) % apiKeys.length;
      return generateContent(prompt, attempt + 1, nextApiKeyIndex);
    }

    throw err;
  }
}

export { generateContent };

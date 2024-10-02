import { LASTFM_DATA_LIMIT } from '$env/static/private';

import { PROMPT_TEMPLATE } from '$lib/data/prompt.js';
import { AVAILABLE_LANGUAGES } from '$lib/data/languages.js';
import { CORS_WHITELIST } from '$lib/data/cors_whitelist.js';

import {
  userExists,
  getRecentTracks,
  getTopTracks,
  getTopArtists,
  getTopAlbums,
  getLovedTracks,
} from '$lib/lastfm.js';
import { generateContent } from '$lib/gemini.js';
import { setCache, getCache } from '$lib/cache.js';

import { error, json } from '@sveltejs/kit';

export async function POST({ request, setHeaders }) {
  const origin = request.headers.get('Origin');
  if (!CORS_WHITELIST.includes(origin)) {
    error(403, { error: 'Not allowed' });
  }

  setHeaders({
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });

  const { username, selectedLanguage } = await request.json();

  if (!username) {
    error(400, { error: 'Please enter your username' });
  }

  if (!selectedLanguage) {
    error(400, { error: 'Please select result language' });
  }

  if (!AVAILABLE_LANGUAGES.includes(selectedLanguage)) {
    error(400, { error: 'The language is not available currently' });
  }

  if (!(await userExists(username))) {
    error(404, { error: 'User not found' });
  }

  const cached = getCache(username);
  if (cached && cached?.selectedLanguage === selectedLanguage) {
    console.log(`Using cached result of ${username}..`);
    return json({ roast: cached?.roast }, { status: 200 });
  }

  const dataLimit = LASTFM_DATA_LIMIT ?? 50;

  console.time('Lastfm API reqs');
  const [recentTracks, topTracks, topArtists, topAlbums, lovedTracks] =
    await Promise.all([
      getRecentTracks(username, dataLimit),
      getTopTracks(username, dataLimit),
      getTopArtists(username, dataLimit),
      getTopAlbums(username, dataLimit),
      getLovedTracks(username, dataLimit),
    ]);
  console.timeEnd('Lastfm API reqs');

  const data = JSON.stringify({
    username,
    ...recentTracks,
    ...topTracks,
    ...topArtists,
    ...topAlbums,
    ...lovedTracks,
  });

  const prompt = PROMPT_TEMPLATE.replace(
    '{{language}}',
    selectedLanguage
  ).replace('{{jsonData}}', data);

  console.time('Gemini req');
  const roast = await generateContent(prompt);
  console.timeEnd('Gemini req');

  setCache(username, { roast, selectedLanguage });

  return json({ roast }, { status: 200 });
}

import { PROD_APP_URL } from '$env/static/private';
import { dev } from '$app/environment';

import { PROMPT_TEMPLATE } from '$lib/data/prompt.js';
import { AVAILABLE_LANGUAGES } from '$lib/data/languages.js';

import {
  userExists,
  getRecentTracks,
  getTopTracks,
  getTopArtists,
  getTopAlbums,
  getLovedTracks,
} from '$lib/lastfm.js';
import { generateContent } from '$lib/gemini.js';

import { error, json } from '@sveltejs/kit';

export async function POST({ request, setHeaders }) {
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

  //so damn slow
  console.time('Lastfm API reqs');
  const [recentTracks, topTracks, topArtists, topAlbums, lovedTracks] =
    await Promise.all([
      getRecentTracks(username),
      getTopTracks(username),
      getTopArtists(username),
      getTopAlbums(username),
      getLovedTracks(username),
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
  // console.log(data);

  const prompt = PROMPT_TEMPLATE.replace(
    '{{language}}',
    selectedLanguage
  ).replace('{{jsonData}}', data);

  console.time('Gemini req');
  const roast = await generateContent(prompt);
  console.timeEnd('Gemini req');

  setHeaders({
    'Access-Control-Allow-Origin': dev ? '*' : PROD_APP_URL,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });

  return json({ roast }, { status: 200 });
}

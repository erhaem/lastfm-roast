import { LASTFM_API_KEY, DEBUG_MODE } from '$env/static/private';

const DEBUG = DEBUG_MODE === 'true';

const BASE_URL = 'https://ws.audioscrobbler.com/2.0/';

/**
 * Build query string from an object
 *
 * @param {Object} params - The query parameters
 * @returns {String} - The query string
 */
function _buildQueryString(params) {
  return new URLSearchParams({
    ...params,
    api_key: LASTFM_API_KEY,
    format: 'json',
  }).toString();
}

/**
 * Fetch data from Last.fm API
 *
 * @param {Object} params - The parameters for the API call
 * @returns {Object} - The response data
 */
async function _fetch(params) {
  const queryString = _buildQueryString(params);

  const response = await fetch(`${BASE_URL}?${queryString}`);
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Check if user exists
 * @param {String} username
 * @returns {Promise<Boolean>}
 */
async function userExists(username) {
  const params = {
    method: 'user.getInfo',
    user: username,
  };

  try {
    await _fetch(params);
    return true;
  } catch (err) {
    if (DEBUG) {
      console.log(`[userExists] ${err.message}`);
    }

    return false;
  }
}

/**
 * Get user's recent tracks
 *
 * @param {String} username
 * @param {Number} [limit=15]
 * @returns {Object}
 */
async function getRecentTracks(username, limit = 15) {
  const params = {
    method: 'user.getRecentTracks',
    user: username,
    limit,
  };

  try {
    const { recenttracks } = await _fetch(params);

    return {
      recent_tracks: recenttracks.track.map(
        (track) => `${track.artist['#text']} - ${track.name}`
      ),
    };
  } catch (err) {
    if (DEBUG) {
      console.log(
        `[getRecentTracks] ${err.message} - the user probably hides the recent tracks [PRIVACY]`
      );
    }

    return { recent_tracks: [] };
  }
}

/**
 * Get user's top tracks
 *
 * @param {String} username
 * @param {Number} [limit=15]
 * @returns {Object}
 */
async function getTopTracks(username, limit = 15) {
  const params = {
    method: 'user.getTopTracks',
    user: username,
    limit,
  };

  try {
    const { toptracks } = await _fetch(params);

    return {
      top_tracks: toptracks.track.map(
        (track) => `${track.artist.name} - ${track.name}`
      ),
    };
  } catch (err) {
    if (DEBUG) {
      console.log(`[getTopTracks] ${err.message}`);
    }

    return { top_tracks: [] };
  }
}

/**
 * Get user's top artists
 *
 * @param {String} username
 * @param {Number} [limit=15]
 * @returns {Object}
 */
async function getTopArtists(username, limit = 15) {
  const params = {
    method: 'user.getTopArtists',
    user: username,
    limit,
  };

  try {
    const { topartists } = await _fetch(params);

    return {
      top_artists: topartists.artist.map((artist) => ({
        name: artist.name,
        play_count: artist.playcount,
      })),
    };
  } catch (err) {
    if (DEBUG) {
      console.log(`[getTopArtists] ${err.message}`);
    }

    return { top_artists: [] };
  }
}

/**
 * Get user's top albums
 *
 * @param {String} username
 * @param {Number} [limit=15]
 * @returns {Object}
 */
async function getTopAlbums(username, limit = 15) {
  const params = {
    method: 'user.getTopAlbums',
    user: username,
    limit,
  };

  try {
    const { topalbums } = await _fetch(params);

    return {
      top_albums: topalbums.album.map((album) => ({
        name: album.name,
        artist_name: album.artist.name,
        play_count: album.playcount,
      })),
    };
  } catch (err) {
    if (DEBUG) {
      console.log(`[getTopAlbums] ${err.message}`);
    }

    return { top_albums: [] };
  }
}

/**
 * Get user's loved tracks
 *
 * @param {String} username
 * @param {Number} [limit=15]
 * @returns {Object}
 */
async function getLovedTracks(username, limit = 15) {
  const params = {
    method: 'user.getLovedTracks',
    user: username,
    limit,
  };

  try {
    const { lovedtracks } = await _fetch(params);

    return {
      loved_tracks: lovedtracks.track.map(
        (track) => `${track.artist.name} - ${track.name}`
      ),
    };
  } catch (err) {
    if (DEBUG) {
      console.log(`[getLovedTracks] ${err.message}`);
    }

    return { loved_tracks: [] };
  }
}

export {
  userExists,
  getRecentTracks,
  getTopTracks,
  getTopArtists,
  getTopAlbums,
  getLovedTracks,
};

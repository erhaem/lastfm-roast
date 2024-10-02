import { CACHE_DURATION } from '$env/static/private';

const THIRTY_MINS = 3600 * 500; //30mins in ms
const cacheDuration = CACHE_DURATION ?? THIRTY_MINS;

const cache = new Map();

function setCache(key, data) {
  const expiry = Date.now() + cacheDuration;
  cache.set(key, { data, expiry });
}

function getCache(key) {
  const cached = cache.get(key);
  if (cached && cached.expiry > Date.now()) {
    return cached.data;
  }

  //clear expired cache
  cache.delete(key);

  return null;
}

export { setCache, getCache };

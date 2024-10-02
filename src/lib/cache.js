import { CACHE_DURATION_IN_MS } from '$env/static/private';

const FIVE_MINS = 300000; //5 mins in ms
const cacheDuration = CACHE_DURATION_IN_MS ?? FIVE_MINS;

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

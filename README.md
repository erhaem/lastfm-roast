# lastfm-roast

Lastfm Roast is Built with Sveltekit.

## Setup

I deployed this on Cloudflare Pages as it's free. Here are the steps:
1. Create fork of this repo and make some modifications if you want to
2. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) -> Compute (Workers) -> Workers & Pages -> Create application
3. Select 'Pages' -> Import an existing Git repository -> Select the forked repo
4. Add this following variables to 'Environment variables (advanced)'
   
```
# format: [Variable name]=[value]

# get lastfm api key: https://www.last.fm/api/account/create
LASTFM_API_KEY=xxxx
# maximum number of results to obtain from Last.fm API
LASTFM_DATA_LIMIT=50

# get gemini api key: https://aistudio.google.com/app/api-keys
# separate your api keys with commas (,) - no whitespace!
# multiple api keys is meant to prevent limitation of each keys
GEMINI_API_KEYS=xxx,xxx,xxx
GEMINI_MODEL=gemini-2.0-flash-001

# cache duration in milliseconds
CACHE_DURATION_IN_MS=300000 # 5 mins

DEBUG_MODE=true
```
5. Save and deploy!

## License
[MIT](LICENSE)

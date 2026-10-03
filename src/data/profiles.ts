// Every external account the site reads from, in one place.
// Data is fetched at build time (see src/lib/live). If a source is unreachable
// the build still succeeds and falls back to the last snapshot, or hides the block.
export const PROFILES = {
  github: { user: 'thevindun', url: 'https://github.com/thevindun' },
  linkedin: { url: 'https://www.linkedin.com/in/thevindu-nagasinghe-9ba2a4342' },
  lichess: { user: 'Ashault_skyliner2005', url: 'https://lichess.org/@/Ashault_skyliner2005' },
  chesscom: { user: 'ashault_skyliner2005', url: 'https://www.chess.com/member/ashault_skyliner2005' },
  duolingo: { user: 'asphaultskyliner', url: 'https://www.duolingo.com/profile/asphaultskyliner' },
  unsplash: { user: 'thevindu_19', url: 'https://unsplash.com/@thevindu_19' },
  pexels: {
    user: 'thevindu19',
    url: 'https://www.pexels.com/@thevindu19/',
    // Pexels' API can't list a user's uploads, so list photo IDs here
    // (the number at the end of a photo URL: pexels.com/photo/…-12345678/).
    photos: [] as { id: number; alt?: string }[],
    views: '72.5K+', // shown on About until the API can read it
  },
  notion: {
    site: 'https://thevindu.notion.site',
    courses: { id: '217870ccc7224762bb81d397472e93cc', url: 'https://thevindu.notion.site/Course-summaries-217870ccc7224762bb81d397472e93cc' },
    reading: { id: '123956bd27f880e892a3f499d7f12a4e', url: 'https://thevindu.notion.site/123956bd27f880e892a3f499d7f12a4e?v=bc61269fcda74ba2886bc90bd09beb3d' },
  },
  appstore: { id: '6768458084', country: 'gb', url: 'https://apps.apple.com/gb/app/aperis/id6768458084' },
  velarox: [
    { label: 'velaroxsolutions.com', url: 'https://velaroxsolutions.com' },
    { label: 'velarox.app', url: 'https://velarox.app' },
  ],
} as const;

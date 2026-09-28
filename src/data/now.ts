// The "Now" block and the live instrument panel on the homepage.
// Update when it changes, not on a schedule.
export const NOW = {
  updated: '2026-09-28',
  items: [
    { label: 'Aperis', lane: 'build', text: 'Closed beta. Most of my week goes into getting real people on it and watching what they do.' },
    { label: 'Reading', lane: 'study', text: 'Why image and text embeddings end up in separate regions of the same space.' },
    { label: 'Building', lane: 'build', text: 'Rewriting Reflct’s memory so entries carry context across months, not days.' },
    { label: 'Off-screen', lane: 'study', text: 'Basketball, chess, and a stubborn attempt to dunk.' },
  ],
  panel: {
    reading: 'Contrastive learning',
    chess: 1240,
    languages: [
      { name: 'Sinhala', pct: 100, note: 'native' },
      { name: 'English', pct: 100, note: 'fluent' },
      { name: 'French', pct: 34, note: 'A2 → B2' },
      { name: 'SQL', pct: 48, note: 'ongoing' },
      { name: 'Contrastive learning', pct: 26, note: 'reading' },
    ],
  },
} as const;

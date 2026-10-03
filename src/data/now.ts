// The "Now" block and the live instrument panel on the homepage.
// Update when it changes, not on a schedule.
export const NOW = {
  updated: '2026-10-01',
  items: [
    { label: 'Work', lane: 'study', text: 'Junior curriculum developer at the University of Alberta, working on ways to make learning more effective.' },
    { label: 'Aperis', lane: 'build', text: 'Live on the App Store, in closed testing on Google Play. Getting it in front of more people.' },
    { label: 'Research', lane: 'study', text: 'Undergraduate research in the Fyshe Lab, on why image and text embeddings drift apart in models like CLIP.' },
    { label: 'Off-screen', lane: 'study', text: 'Photographing nature, learning French, and the occasional game of chess.' },
  ],
  panel: {
    reading: 'Nothing listed yet',
    chess: 1456,
    // No FIDE API — update by hand from https://ratings.fide.com/profile/29900395
    fide: { id: '29900395', standard: 1456, blitz: 1515, url: 'https://ratings.fide.com/profile/29900395' },
    languages: [
      { name: 'English', pct: 100, note: 'fluent' },
      { name: 'Sinhala', pct: 65, note: 'conversational' },
      { name: 'French', pct: 12, note: 'beginner' },
      { name: 'Hindi', pct: 15, note: 'basic' },
    ],
  },
} as const;

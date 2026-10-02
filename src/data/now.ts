// The "Now" block and the live instrument panel on the homepage.
// Update when it changes, not on a schedule.
export const NOW = {
  updated: '2026-10-01',
  items: [
    { label: 'Work', lane: 'study', text: 'Junior curriculum developer at the University of Alberta, working on ways to make learning more effective.' },
    { label: 'Aperis', lane: 'build', text: 'Live on the App Store, in closed testing on Google Play. Getting it in front of more people.' },
    { label: 'Learning', lane: 'study', text: 'French, from zero. Slowly.' },
    { label: 'Off-screen', lane: 'study', text: 'Photographing nature, and the occasional game of chess.' },
  ],
  panel: {
    reading: 'Nothing listed yet',
    chess: 1450,
    languages: [
      { name: 'English', pct: 100, note: 'fluent' },
      { name: 'Sinhala', pct: 65, note: 'conversational' },
      { name: 'French', pct: 12, note: 'beginner' },
      { name: 'Hindi', pct: 15, note: 'basic' },
    ],
  },
} as const;

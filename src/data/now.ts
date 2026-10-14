// The "Now" block and the live instrument panel on the homepage.
// Update when it changes, not on a schedule.
export const NOW = {
  updated: '2026-10-01',
  // The one line people read first. Keep it to what's true this week.
  headline: 'Working a co\u2011op term, growing Aperis, and getting through CMPUT 379.', // VERIFY: draft
  // Short lines only, and nothing the cells around it already say (term, chess, French have their own).
  items: [
    { label: 'Work', lane: 'study', text: 'Junior curriculum developer, University of Alberta', chip: 'co-op', href: '/cv' },
    { label: 'Aperis', lane: 'build', text: 'Getting it in front of more people', chip: 'live on iOS', href: '/work/aperis' },
  ],
  panel: {
    // Backup for when Duolingo doesn't answer: the day the current streak started (YYYY-MM-DD).
    // The site counts the days from it, so it stays right without any API. Leave '' to skip.
    duolingo: { streakStart: '' },
    reading: 'Nothing listed yet',
    chess: 1456,
    // No FIDE API — update by hand from https://ratings.fide.com/profile/29900395 (asOf = the day you checked; VERIFY)
    fide: { id: '29900395', standard: 1456, blitz: 1515, asOf: '2026-10-01', url: 'https://ratings.fide.com/profile/29900395' },
    languages: [
      { name: 'English', pct: 100, note: 'fluent' },
      { name: 'Sinhala', pct: 65, note: 'conversational' },
      { name: 'French', pct: 12, note: 'beginner' },
      { name: 'Hindi', pct: 15, note: 'basic' },
    ],
  },
} as const;

// Placeholder data for the interactive matcher on /work/aperis.
// Dimension names are illustrative — replace with the real five.
export const DIMS = [
  { name: 'Values', hint: 'what you won’t trade', w: 5 },
  { name: 'Conflict', hint: 'how you argue', w: 4 },
  { name: 'Ambition', hint: 'where you’re headed', w: 3 },
  { name: 'Social energy', hint: 'nights in vs out', w: 2 },
  { name: 'Humour', hint: 'what lands', w: 2 },
];

// Answers are 0–1 on each dimension.
export const YOU = [0.8, 0.35, 0.7, 0.4, 0.65];

export const PROFILES = [
  { handle: 'Quiet kettle', note: 'Writes letters. Actually posts them.', v: [0.78, 0.3, 0.55, 0.2, 0.7] },
  { handle: 'Night runner', note: 'Training for something, won’t say what.', v: [0.6, 0.55, 0.92, 0.5, 0.4] },
  { handle: 'Paper crane', note: 'Folds things when thinking.', v: [0.85, 0.4, 0.6, 0.35, 0.55] },
  { handle: 'Loud library', note: 'Reads out the good bits.', v: [0.45, 0.7, 0.4, 0.9, 0.9] },
  { handle: 'Low tide', note: 'Slow to reply, always replies.', v: [0.9, 0.2, 0.35, 0.25, 0.5] },
  { handle: 'Second draft', note: 'Rewrites texts before sending.', v: [0.7, 0.3, 0.8, 0.55, 0.75] },
  { handle: 'Open tab', note: 'Forty of them. Knows where each one is.', v: [0.3, 0.8, 0.85, 0.7, 0.3] },
  { handle: 'Warm static', note: 'Finds the song before the chorus.', v: [0.55, 0.45, 0.25, 0.6, 0.95] },
];

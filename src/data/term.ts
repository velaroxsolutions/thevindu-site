// "This term" on /about and the homepage. Update each term; the block hides when empty.
// take: one honest line — what you think of it so far.
export const TERM = {
  label: 'Fall 2026',
  courses: [
    { name: 'Databases' },
    { name: 'Software Engineering' },
    { name: 'Operating Systems' },
    { name: 'Software Testing' },
    { code: 'ECE 449', name: '' },
  ] as { code?: string; name: string; take?: string }[],
};

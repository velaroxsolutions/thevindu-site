// "This term" on /about and the homepage. Update each term.
// mode: what the term is (study term, co-op work term…). take: one honest line per course.
export const TERM = {
  label: 'Fall 2026',
  mode: 'Co-op work term',
  note: 'Working full-time this term, with one course alongside it.',
  courses: [
    { code: 'CMPUT 379', name: 'Operating System Concepts' },
  ] as { code?: string; name: string; take?: string }[],
};

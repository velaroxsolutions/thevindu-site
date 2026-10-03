// Single source of truth for identity, links and navigation.
// Swap the placeholders here and every page picks them up.
export const SITE = {
  url: 'https://thevindu.dev', // TODO: your real domain
  name: 'Thevindu Nagasinghe',
  short: 'THEV',
  // The +site tag lands in the same inbox — filter on it in Gmail to see what came from here.
  // Never written into the HTML as-is; see lib/email.ts.
  email: 'thevindu.edu+site@gmail.com',
  location: 'Edmonton, Alberta',
  timezone: 'America/Edmonton',
  description:
    'I build software and AI tools under Velarox, and share what I learn along the way. Computer engineering at the University of Alberta.',
  resumePdf: '/resume.pdf', // drop the file in /public
  // Shown in the header, contact block, menu and footer.
  socials: [
    { label: 'GitHub', href: 'https://github.com/thevindun' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/thevindu-nagasinghe-9ba2a4342' },
    { label: 'Pexels', href: 'https://www.pexels.com/@thevindu19/' },
  ],
} as const;

export const NAV = [
  { href: '/work', label: 'Work' },
  { href: '/lessons', label: 'Lessons' },
  { href: '/library', label: 'Library' },
  { href: '/photos', label: 'Photos' },
  { href: '/about', label: 'About' },
] as const;

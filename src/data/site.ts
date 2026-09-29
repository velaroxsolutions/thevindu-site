// Single source of truth for identity, links and navigation.
// Swap the placeholders here and every page picks them up.
export const SITE = {
  url: 'https://thevindu.dev', // TODO: your real domain
  name: 'Thevindu Nagasinghe',
  short: 'THEV',
  email: 'hello@thevindu.dev', // TODO: your real email
  location: 'Edmonton, Alberta',
  timezone: 'America/Edmonton',
  description:
    'I ship software under Velarox and study how machines represent meaning. Computer engineering at the University of Alberta.',
  resumePdf: '/resume.pdf', // drop the file in /public
  // Shown in the header, contact block, menu and footer.
  socials: [
    { label: 'GitHub', href: 'https://github.com/thevindun' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/thevindu-nagasinghe-9ba2a4342' },
  ],
} as const;

export const NAV = [
  { href: '/work', label: 'Work' },
  { href: '/notes', label: 'Notes' },
  { href: '/library', label: 'Library' },
  { href: '/photos', label: 'Photos' },
  { href: '/about', label: 'About' },
] as const;

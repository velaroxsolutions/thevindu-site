import { SITE } from '../data/site';
// Encode the address so it isn't sitting in the HTML for scrapers. The browser
// decodes it (scripts/email.ts) into every [data-e] link and the copy buttons.
export const encodedEmail = Buffer.from([...SITE.email].reverse().join('')).toString('base64');
// What people without JavaScript see.
export const displayEmail = 'Email me';

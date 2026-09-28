import { $$, copyText } from './util';
import { SITE_EMAIL } from './site-config';

$$('[data-copy-email]').forEach((b) => b.addEventListener('click', () => {
  copyText(SITE_EMAIL, 'Email copied');
  const o = b.textContent; b.textContent = 'Copied ✓'; setTimeout(() => (b.textContent = o), 1400);
}));
$$('[data-copy-target]').forEach((b) => b.addEventListener('click', () => {
  const src = document.getElementById(b.dataset.copyTarget!);
  if (src) copyText(src.innerText.trim(), 'Template copied');
}));

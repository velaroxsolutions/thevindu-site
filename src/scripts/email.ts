// Decode the obfuscated address once and wire up every place that shows it.
const holder = document.getElementById('e-data');
export const EMAIL = holder ? [...atob(holder.dataset.e || '')].reverse().join('') : '';
if (EMAIL) {
  document.querySelectorAll<HTMLAnchorElement>('a[data-e]').forEach((a) => {
    a.href = `mailto:${EMAIL}`;
    if (a.dataset.e === 'text') a.textContent = EMAIL;
  });
}

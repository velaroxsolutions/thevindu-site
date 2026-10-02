import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';
import { PHOTO_META, PHOTO_ORDER } from '../data/photos';
import { PROFILES } from '../data/profiles';
import type { Photo } from './live/photos';

const files = import.meta.glob<{ default: ImageMetadata }>('../assets/photos/*.{jpg,jpeg,png,webp}', { eager: true });

let cache: Promise<Photo[]> | null = null;

/** Your own photos, optimised: a 900px WebP for the grid and a 1600px one for the lightbox. */
export function localPhotos(): Promise<Photo[]> {
  cache ??= (async () => {
    const entries = Object.entries(files).map(([path, mod]) => ({ name: path.split('/').pop()!, img: mod.default }));
    const rank = (n: string) => { const i = PHOTO_ORDER.indexOf(n); return i < 0 ? 999 : i; };
    entries.sort((a, b) => rank(a.name) - rank(b.name) || a.name.localeCompare(b.name, undefined, { numeric: true }));
    return Promise.all(entries.map(async ({ name, img }) => {
      const [sm, lg] = await Promise.all([
        getImage({ src: img, width: 900, format: 'webp', quality: 72 }),
        getImage({ src: img, width: 1600, format: 'webp', quality: 74 }),
      ]);
      const meta = PHOTO_META[name];
      return {
        id: `l-${name}`, src: sm.src, full: lg.src, w: img.width, h: img.height,
        alt: meta?.alt ?? 'Photo by Thevindu Nagasinghe', color: '#3a3f47',
        href: PROFILES.pexels.url, source: 'pexels' as const,
      };
    }));
  })();
  return cache;
}

import { live, token } from './core';
import { PROFILES } from '../../data/profiles';

export type Photo = { id: string; src: string; full: string; w: number; h: number; alt: string; color: string; href: string; source: 'unsplash' | 'pexels'; date?: string };

// Unsplash: needs a free access key (UNSPLASH_ACCESS_KEY). Pexels: IDs listed in profiles.ts.
export const photos = () =>
  live<{ photos: Photo[]; stats: { views?: number; downloads?: number } }>('photos', async (get) => {
    const out: Photo[] = [];
    let stats = {};
    const key = token('UNSPLASH_ACCESS_KEY');
    if (key) {
      const h = { headers: { Authorization: `Client-ID ${key}`, 'Accept-Version': 'v1' } };
      const [list, st] = await Promise.all([
        get(`https://api.unsplash.com/users/${PROFILES.unsplash.user}/photos?per_page=30&order_by=latest`, h),
        get(`https://api.unsplash.com/users/${PROFILES.unsplash.user}/statistics`, h).catch(() => null),
      ]);
      (list || []).forEach((p: any) => out.push({
        id: `u-${p.id}`, src: `${p.urls.raw}&w=900&q=75&auto=format`, full: `${p.urls.raw}&w=2000&q=80&auto=format`,
        w: p.width, h: p.height, alt: p.alt_description || p.description || 'Photo', color: p.color || '#888',
        href: p.links.html, source: 'unsplash', date: p.created_at,
      }));
      if (st) stats = { views: st.views?.total, downloads: st.downloads?.total };
    }
    PROFILES.pexels.photos.forEach((p) => out.push({
      id: `p-${p.id}`, src: `https://images.pexels.com/photos/${p.id}/pexels-photo-${p.id}.jpeg?auto=compress&w=900`,
      full: `https://images.pexels.com/photos/${p.id}/pexels-photo-${p.id}.jpeg?auto=compress&w=2000`,
      w: 4, h: 5, alt: p.alt || 'Photo', color: '#888', href: `https://www.pexels.com/photo/${p.id}/`, source: 'pexels',
    }));
    return out.length ? { photos: out, stats } : null;
  });

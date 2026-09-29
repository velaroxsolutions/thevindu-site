import { live } from './core';
import { PROFILES } from '../../data/profiles';

export type App = {
  name: string; seller: string; icon: string; screenshots: string[]; rating: number | null; ratings: number;
  version: string; updated: string; released: string; notes: string | null; genre: string; price: string; url: string; description: string;
};

export const appstore = () =>
  live<App>('appstore', async (get) => {
    const { id, country } = PROFILES.appstore;
    const r = await get(`https://itunes.apple.com/lookup?id=${id}&country=${country}`);
    const a = r?.results?.[0];
    if (!a) return null;
    return {
      name: a.trackName, seller: a.sellerName, icon: a.artworkUrl512 || a.artworkUrl100,
      screenshots: (a.screenshotUrls || []).slice(0, 8), rating: a.userRatingCount ? a.averageUserRating : null, ratings: a.userRatingCount || 0,
      version: a.version, updated: a.currentVersionReleaseDate, released: a.releaseDate, notes: a.releaseNotes || null,
      genre: a.primaryGenreName, price: a.formattedPrice, url: a.trackViewUrl?.split('?')[0] || PROFILES.appstore.url,
      description: (a.description || '').split('\n').find((l: string) => l.trim().length > 40) || '',
    };
  });

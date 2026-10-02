// Your own photos, in src/assets/photos/. Drop a new file in and it appears;
// add a line here to give it alt text (and optionally a caption/place).
// Files are resized and converted to WebP at build time — keep the originals full size.
export const PHOTO_META: Record<string, { alt: string; caption?: string }> = {
  '1.jpg': { alt: 'A cluster of green fruit hanging between long, spiked leaves' },
  '2.jpg': { alt: 'A yellow and blue passenger boat crossing turquoise water under a light sky' },
  '3.jpg': { alt: 'A lone figure at the water’s edge as the sun sets gold over the sea' },
  '4.jpg': { alt: 'A dirt road curving through dappled light under a canopy of trees' },
  '5.jpg': { alt: 'A street corner with a pink hotel building under a grey, cloudy sky' },
  '6.jpg': { alt: 'A white tour boat moored in turquoise water, with ships on the horizon' },
  '7.jpg': { alt: 'A waterfall stepping down over rocks through dense green forest' },
  '8.jpg': { alt: 'A shaded dirt road under leaning trees, sunlight breaking through the leaves' },
};
// Order on the page (filenames). Anything not listed is appended after.
export const PHOTO_ORDER = ['7.jpg', '3.jpg', '2.jpg', '4.jpg', '1.jpg', '6.jpg', '5.jpg', '8.jpg'];

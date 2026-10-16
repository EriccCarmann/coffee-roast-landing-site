import { REMOTE_IMAGES } from './imageSources';

export type ImageKey = keyof typeof REMOTE_IMAGES;

// Default: hotlink the Tilda CDN so the site works out of the box.
// After `npm run images`, set NEXT_PUBLIC_LOCAL_IMAGES=true to serve local copies.
// Next.js replaces process.env.NEXT_PUBLIC_* with the literal value at build time.
const useLocal = process.env.NEXT_PUBLIC_LOCAL_IMAGES === 'true';

export const img = (key: ImageKey): string =>
  useLocal ? `/images/${REMOTE_IMAGES[key].file}` : REMOTE_IMAGES[key].url;

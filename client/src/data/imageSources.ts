// Original Tilda CDN images. `npm run images` downloads them to public/images.
const CDN = 'https://static.tildacdn.ink';

// `satisfies` checks the shape without widening the type, so
// keyof typeof REMOTE_IMAGES is the exact list of keys (see ImageKey in images.ts).
export const REMOTE_IMAGES = {
  hero: { file: 'hero.jpg', url: `${CDN}/tild3539-6433-4632-a561-323431343164/photo-1511537190424-.jpg` },
  packing: { file: 'packing.jpg', url: `${CDN}/tild3663-3933-4461-b230-643761376362/photo-1512372388054-.jpg` },
  ethiopia: { file: 'ethiopia.jpg', url: `${CDN}/tild6330-3838-4234-b030-343230386331/photo-1525088553748-.jpg` },
  colombia: { file: 'colombia.jpg', url: `${CDN}/tild6438-3164-4366-b563-366438376639/photo-1447933601403-.jpg` },
  brazil: { file: 'brazil.jpg', url: `${CDN}/tild3537-3132-4538-b463-373862363739/photo-1615486825258-.jpg` },
  drip: { file: 'drip.jpg', url: `${CDN}/tild3131-3638-4461-a165-633361636363/photo-1668786694813-.jpg` },

  iconCoffee: { file: 'icon-coffee.svg', url: `${CDN}/lib/icons/tilda/coffee_machine_drink.svg` },
  iconClock: { file: 'icon-clock.svg', url: `${CDN}/lib/icons/tilda/watch_clock_time.svg` },
  iconLeaf: { file: 'icon-leaf.svg', url: `${CDN}/lib/icons/tilda/recycle_eco_leaf.svg` },
  iconVan: { file: 'icon-van.svg', url: `${CDN}/lib/icons/tilda/van_delivery_car.svg` },
  iconMap: { file: 'icon-map.svg', url: `${CDN}/lib/icons/tilda/map_way_mark_where_adress.svg` },
  iconPhone: { file: 'icon-phone.svg', url: `${CDN}/lib/icons/tilda/phone_contact_call.svg` },
} satisfies Record<string, { file: string; url: string }>;

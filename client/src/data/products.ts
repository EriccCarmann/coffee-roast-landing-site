// Single source of truth for products. Used by the cards, the form <select>,
// and the API route (to validate the order type).
// `as const` freezes the values as literal types, so TypeScript knows the exact
// ids ('ethiopia' | 'colombia' | ...) instead of just `string`. Think of it as
// turning a List<string> into an enum.

export const ROAST_PRODUCTS = [
  { id: 'ethiopia', price: 32, image: 'ethiopia' },
  { id: 'colombia', price: 29, image: 'colombia' },
  { id: 'brazil', price: 26, image: 'brazil' },
  { id: 'drip', price: 18, image: 'drip' },
] as const;

export const SUBSCRIPTION = { id: 'subscription', price: 54 } as const;

export const PRODUCTS = [...ROAST_PRODUCTS, SUBSCRIPTION] as const;

// Extra choices in the form that are not products.
export const SPECIAL_ORDER_TYPES = ['one-time', 'advice'] as const;

export type ProductId = (typeof PRODUCTS)[number]['id'];
export type OrderType = ProductId | (typeof SPECIAL_ORDER_TYPES)[number];

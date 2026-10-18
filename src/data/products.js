// Prices live only here: the cards, subscription, hero button and the form's select all read them.
export const PRICES = { eth: 32, col: 29, bra: 26, drip: 18, sub: 54 };

// Roast cards: n is the key number in the locales (products.n1, products.f1 ...).
// order is the value sent to the manager in the request (always Russian, whatever language the site is in).
export const PRODUCTS = [
  { id: 'eth', n: 1, price: PRICES.eth, order: 'Эфиопия Иргачеффе' },
  { id: 'col', n: 2, price: PRICES.col, order: 'Колумбия Уила' },
  { id: 'bra', n: 3, price: PRICES.bra, order: 'Бразилия Серрадо' },
  { id: 'drip', n: 4, price: PRICES.drip, order: 'Дрип-пакеты' },
];

export const SUBSCRIPTION_ORDER = 'Подписка';

// Options of the form's select. key is the label key in the locales (order.o1 ...); price fills {price}.
export const ORDER_OPTIONS = [
  { key: 'o1', value: 'Разовый заказ — сорт уточню' },
  { key: 'o2', value: 'Эфиопия Иргачеффе', price: PRICES.eth },
  { key: 'o3', value: 'Колумбия Уила', price: PRICES.col },
  { key: 'o4', value: 'Бразилия Серрадо', price: PRICES.bra },
  { key: 'o5', value: 'Дрип-пакеты', price: PRICES.drip },
  { key: 'o6', value: SUBSCRIPTION_ORDER, price: PRICES.sub },
  { key: 'o7', value: 'Пока не выбрал, нужен совет' },
];
export const DEFAULT_ORDER = ORDER_OPTIONS[0].value;

export const PHONE = '+375 29 345-67-89';
export const PHONE_HREF = 'tel:+375293456789';

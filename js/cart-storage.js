import { MAX_QUANTITY } from './cart.js';
export const CART_KEY = 'cartnova.cart.v1';
export function parseCart(raw) {
  if (raw === null) return { items: [], warning: '' };
  try {
    const data = JSON.parse(raw);
    if (!data || data.version !== 1 || !Array.isArray(data.items) || data.items.length > 1000) throw new Error('Invalid storage format');
    const merged = new Map();
    let changed = false;
    for (const item of data.items) {
      if (!item || !Number.isSafeInteger(item.productId) || item.productId < 1 || !Number.isSafeInteger(item.quantity) || item.quantity < 1 || item.quantity > MAX_QUANTITY) { changed = true; continue; }
      if (merged.has(item.productId)) changed = true;
      merged.set(item.productId, Math.min(MAX_QUANTITY, (merged.get(item.productId) || 0) + item.quantity));
    }
    return { items: [...merged].map(([productId, quantity]) => ({ productId, quantity })), warning: changed ? 'Some invalid saved bag entries were repaired or removed.' : '' };
  } catch { return { items: [], warning: 'Your saved bag could not be read. We started a fresh bag.' }; }
}
export function loadCart(getStorage = () => globalThis.localStorage) {
  try { return parseCart(getStorage().getItem(CART_KEY)); }
  catch { return { items: [], warning: 'Browser storage is unavailable. Your bag will last for this tab only.' }; }
}
export function saveCart(items, getStorage = () => globalThis.localStorage) {
  try {
    getStorage().setItem(CART_KEY, JSON.stringify({ version: 1, items: items.map(({ productId, quantity }) => ({ productId, quantity })) }));
    return '';
  } catch { return 'Your bag could not be saved. Keep this tab open to retain its contents.'; }
}
export function reconcileCart(items, products) {
  const ids = new Set(products.map(product => product.id));
  return items.filter(item => ids.has(item.productId));
}

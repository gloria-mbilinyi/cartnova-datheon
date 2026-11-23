import { MAX_QUANTITY } from './cart.js';
export function resolveCartLines(items, products) {
  const seen = new Set();
  return items.map(item => {
    const product = products.find(product => product.id === item.productId);
    if (!product || seen.has(item.productId) || !Number.isSafeInteger(item.quantity) || item.quantity < 1 || item.quantity > MAX_QUANTITY
      || !Number.isSafeInteger(product.priceCents) || product.priceCents < 0) throw new RangeError('The bag contains an unavailable product or invalid quantity/price.');
    seen.add(item.productId);
    const lineTotal = product.priceCents * item.quantity;
    if (!Number.isSafeInteger(lineTotal)) throw new RangeError('The line total exceeds the supported range.');
    return { product, quantity: item.quantity, lineTotal };
  });
}
export function calculateSubtotal(items, products) {
  const subtotal = resolveCartLines(items, products).reduce((sum, item) => sum + item.lineTotal, 0);
  if (!Number.isSafeInteger(subtotal)) throw new RangeError('The subtotal exceeds the supported range.');
  return subtotal;
}
export const DEMO_POLICY = Object.freeze({ taxPercent: 8, shippingCents: 500, freeShippingAtCents: 10000 });
export const POLICY_TEXT = 'Demo policy: 8% tax, rounded to the nearest cent. $5 shipping below $100; free shipping at $100+. Empty bags cost $0. Illustrative rules only.';
function validSubtotal(subtotal) {
  if (!Number.isSafeInteger(subtotal) || subtotal < 0 || subtotal > Number.MAX_SAFE_INTEGER / 108) throw new RangeError('Invalid subtotal.');
}
export function calculateTax(subtotal) { validSubtotal(subtotal); return Math.round(subtotal * DEMO_POLICY.taxPercent / 100); }
export function calculateShipping(subtotal, hasItems = subtotal > 0) { validSubtotal(subtotal); return hasItems && subtotal < DEMO_POLICY.freeShippingAtCents ? DEMO_POLICY.shippingCents : 0; }
export function calculateTotal(items, products) {
  const subtotal = calculateSubtotal(items, products);
  const tax = calculateTax(subtotal);
  const shipping = calculateShipping(subtotal, items.length > 0);
  return Object.freeze({ subtotal, tax, shipping, total: subtotal + tax + shipping });
}

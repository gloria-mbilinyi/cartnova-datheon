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

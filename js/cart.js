export const MAX_QUANTITY = 99;
export function addToCart(items, productId, products) {
  if (!products.some(product => product.id === productId)) throw new RangeError('This product is unavailable.');
  const existing = items.find(item => item.productId === productId);
  if (!existing) return [...items, { productId, quantity: 1 }];
  return items.map(item => item.productId === productId ? { ...item, quantity: Math.min(MAX_QUANTITY, item.quantity + 1) } : item);
}
export const cartCount = items => items.reduce((total, item) => total + item.quantity, 0);
export function removeFromCart(items, productId) {
  return items.filter(item => item.productId !== productId);
}
/** Quantity zero explicitly removes the item; all other values must be 1–99. */
export function updateQuantity(items, productId, quantity) {
  if (!Number.isSafeInteger(quantity) || quantity < 0 || quantity > MAX_QUANTITY) throw new RangeError('Quantity must be a whole number from 0 to 99.');
  if (quantity === 0) return removeFromCart(items, productId);
  return items.map(item => item.productId === productId ? { ...item, quantity } : item);
}

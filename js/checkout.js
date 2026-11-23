import { calculateTotal } from './calculations.js';
import { cartCount } from './cart.js';
export function validateCheckout(fields) {
  const name = String(fields.name || '').trim();
  const email = String(fields.email || '').trim();
  const address = String(fields.address || '').trim();
  const errors = {};
  if (name.length < 2 || name.length > 100) errors.name = 'Enter your name (2–100 characters).';
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email address, such as name@example.com.';
  if (address.length < 8 || address.length > 500) errors.address = 'Enter a shipping address (8–500 characters).';
  return errors;
}
/** A local simulation: returns no customer information and performs no network request. */
export function createDemoOrder({ fields, cart, products, status }, referenceFactory = () => `DEMO-${crypto.randomUUID().slice(0, 8).toUpperCase()}`) {
  if (Object.keys(validateCheckout(fields)).length) throw new Error('Check your customer details before continuing.');
  if (status !== 'ready') throw new Error('Current product prices are not verified. Reload the catalog before checkout.');
  if (!cart.length) throw new Error('Your bag is empty. Add a product before checkout.');
  const totals = calculateTotal(cart, products);
  return Object.freeze({ reference: referenceFactory(), quantity: cartCount(cart), ...totals });
}

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { addToCart, removeFromCart, updateQuantity, cartCount, MAX_QUANTITY } from '../js/cart.js';
import { normalizeProducts } from '../js/products.js';
import { rawProducts } from './fixtures/products.js';
const products = normalizeProducts(rawProducts);
test('quantity changes support increments, decrements, and explicit removal at zero', () => {
  const items = [{ productId:1, quantity:2 }];
  assert.equal(updateQuantity(items, 1, 3)[0].quantity, 3);
  assert.equal(updateQuantity(items, 1, 1)[0].quantity, 1);
  assert.deepEqual(updateQuantity(items, 1, 0), []);
  assert.equal(items[0].quantity, 2);
});
test('quantity validation rejects negatives, fractions, strings, NaN, infinity and excess', () => {
  for (const quantity of [-1, .5, '2', NaN, Infinity, 100]) assert.throws(() => updateQuantity([], 1, quantity), /whole number/);
  assert.deepEqual(updateQuantity([], 1, 1), []);
});
test('removal affects only the selected item and tolerates absent IDs', () => {
  const items = [{ productId:1, quantity:2 }, { productId:2, quantity:1 }];
  assert.deepEqual(removeFromCart(items, 1), [{ productId:2, quantity:1 }]);
  assert.deepEqual(removeFromCart(items, 99), items);
  assert.equal(items.length, 2);
});
test('adding products creates ID/quantity lines and increments existing lines immutably', () => {
  const initial = addToCart([], 1, products);
  const next = addToCart(addToCart(initial, 1, products), 2, products);
  assert.deepEqual(next, [{ productId:1, quantity:2 }, { productId:2, quantity:1 }]);
  assert.equal(cartCount(next), 3);
  assert.equal(initial[0].quantity, 1);
});
test('adding rejects unavailable products and caps quantity at 99', () => {
  assert.throws(() => addToCart([], 999, products), /unavailable/);
  assert.equal(addToCart([{ productId:1, quantity:MAX_QUANTITY }], 1, products)[0].quantity, 99);
});

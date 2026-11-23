import assert from 'node:assert/strict';
import { test } from 'node:test';
import { calculateSubtotal } from '../js/calculations.js';
import { normalizeProducts } from '../js/products.js';
import { rawProducts } from './fixtures/products.js';
const products = normalizeProducts(rawProducts);
test('subtotal uses current integer-cent prices and all quantities', () => {
  assert.equal(calculateSubtotal([{productId:1,quantity:2},{productId:2,quantity:1}], products), 14499);
  assert.equal(calculateSubtotal([], products), 0);
});
test('subtotal rejects unavailable products and invalid or duplicate lines', () => {
  for (const items of [[{productId:99,quantity:1}],[{productId:1,quantity:NaN}],[{productId:1,quantity:0}],[{productId:1,quantity:1},{productId:1,quantity:1}]]) assert.throws(()=>calculateSubtotal(items,products));
  assert.throws(()=>calculateSubtotal([{productId:1,quantity:2}],[{id:1,priceCents:Infinity}]));
});

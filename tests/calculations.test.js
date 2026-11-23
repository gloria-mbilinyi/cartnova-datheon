import assert from 'node:assert/strict';
import { test } from 'node:test';
import { calculateSubtotal, calculateTax, calculateShipping, calculateTotal } from '../js/calculations.js';
import { normalizeProducts } from '../js/products.js';
import { rawProducts } from './fixtures/products.js';
const products = normalizeProducts(rawProducts);
test('demo tax rounds half-cent boundaries consistently', () => {
  assert.equal(calculateTax(6), 0);
  assert.equal(calculateTax(7), 1);
  assert.equal(calculateTax(9999), 800);
  assert.equal(calculateTax(10000), 800);
});
test('shipping switches exactly at $100 and empty carts cost zero', () => {
  assert.equal(calculateShipping(0), 0);
  assert.equal(calculateShipping(9999), 500);
  assert.equal(calculateShipping(10000), 0);
  assert.equal(calculateShipping(10001), 0);
  assert.deepEqual(calculateTotal([], products), {subtotal:0,tax:0,shipping:0,total:0});
});
test('grand total includes current subtotal, rounded tax, and shipping', () => {
  assert.deepEqual(calculateTotal([{productId:1,quantity:1}],products), {subtotal:4499,tax:360,shipping:500,total:5359});
  assert.deepEqual(calculateTotal([{productId:1,quantity:1},{productId:2,quantity:1}],products), {subtotal:10000,tax:800,shipping:0,total:10800});
  for (const value of [-1, NaN, Infinity, '10', .5]) assert.throws(()=>calculateTax(value));
});
test('subtotal uses current integer-cent prices and all quantities', () => {
  assert.equal(calculateSubtotal([{productId:1,quantity:2},{productId:2,quantity:1}], products), 14499);
  assert.equal(calculateSubtotal([], products), 0);
});
test('subtotal rejects unavailable products and invalid or duplicate lines', () => {
  for (const items of [[{productId:99,quantity:1}],[{productId:1,quantity:NaN}],[{productId:1,quantity:0}],[{productId:1,quantity:1},{productId:1,quantity:1}]]) assert.throws(()=>calculateSubtotal(items,products));
  assert.throws(()=>calculateSubtotal([{productId:1,quantity:2}],[{id:1,priceCents:Infinity}]));
});

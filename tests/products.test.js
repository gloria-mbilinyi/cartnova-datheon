import assert from 'node:assert/strict';
import { test } from 'node:test';
import { normalizeProducts } from '../js/products.js';
import { rawProducts } from './fixtures/products.js';
test('normalizes actual schema into immutable product data with integer cents', () => {
  const product = normalizeProducts(rawProducts)[0];
  assert.equal(product.priceCents, 4499);
  assert.equal(product.title, 'Canvas backpack');
  assert.ok(Object.isFrozen(product));
  assert.equal(Object.hasOwn(product, 'price'), false);
});
test('rejects invalid catalog shapes and duplicate IDs', () => {
  for (const value of [null, {}, 'products', [rawProducts[0], rawProducts[0]]]) assert.throws(() => normalizeProducts(value));
});
test('rejects untrusted prices, ratings, images, categories, and identifiers', () => {
  for (const patch of [{ price: NaN }, { price: Infinity }, { price: -1 }, { price: '12' }, { id: 0 }, { id: 1.2 }, { title: '' }, { category: 'other' }, { image: 'javascript:alert(1)' }, { rating: { rate: 6, count: 0 } }, { rating: { rate: 4, count: -1 } }]) assert.throws(() => normalizeProducts([{ ...rawProducts[0], ...patch }]), JSON.stringify(patch));
});
test('allows empty responses and safely rounds sub-cent source prices', () => {
  assert.deepEqual(normalizeProducts([]), []);
  assert.equal(normalizeProducts([{ ...rawProducts[0], price: 1.005 }])[0].priceCents, 101);
});

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { filterCategory } from '../js/filters.js';
import { normalizeProducts } from '../js/products.js';
import { rawProducts } from './fixtures/products.js';
const products = normalizeProducts(rawProducts);
test('filters API categories and groups both clothing categories', () => {
  assert.deepEqual(filterCategory(products, 'clothing').map(p => p.id), [1, 4]);
  assert.deepEqual(filterCategory(products, 'electronics').map(p => p.id), [2]);
  assert.deepEqual(filterCategory(products, 'jewelery').map(p => p.id), [3]);
  assert.deepEqual(filterCategory(products, "women's clothing").map(p => p.id), [4]);
  assert.equal(filterCategory(products).length, 4);
  assert.deepEqual(filterCategory(products, 'unknown'), []);
});

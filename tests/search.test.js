import assert from 'node:assert/strict';
import { test } from 'node:test';
import { searchProducts } from '../js/search.js';
import { filterCategory } from '../js/filters.js';
import { normalizeProducts } from '../js/products.js';
import { rawProducts } from './fixtures/products.js';
const products = normalizeProducts(rawProducts);
test('matches title, description, human category, whitespace, and case', () => {
  assert.equal(searchProducts(products, '  CANVAS   blue ')[0].id, 1);
  assert.equal(searchProducts(products, 'jewelry')[0].id, 3);
  assert.equal(searchProducts(products, '').length, 4);
  assert.deepEqual(searchProducts(products, 'no such product'), []);
});
test('search and category filters intersect correctly without changing the catalog', () => {
  assert.deepEqual(searchProducts(filterCategory(products, 'clothing'), 'blue').map(p => p.id), [1]);
  assert.equal(products.length, 4);
});

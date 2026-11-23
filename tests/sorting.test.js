import assert from 'node:assert/strict';
import { test } from 'node:test';
import { sortProducts } from '../js/sorting.js';
import { normalizeProducts } from '../js/products.js';
import { rawProducts } from './fixtures/products.js';
const products = normalizeProducts(rawProducts);
test('supports every requested order without mutating source data', () => {
  const ids = order => sortProducts(products, order).map(p => p.id);
  assert.deepEqual(ids('default'), [1,2,3,4]);
  assert.deepEqual(ids('price-asc'), [3,4,1,2]);
  assert.deepEqual(ids('price-desc'), [2,1,4,3]);
  assert.deepEqual(ids('rating'), [3,1,2,4]);
  assert.deepEqual(ids('name'), [1,4,3,2]);
  assert.deepEqual(products.map(p=>p.id), [1,2,3,4]);
});

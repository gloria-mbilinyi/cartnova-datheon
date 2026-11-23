import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createStore, visibleProducts } from '../js/state.js';
import { normalizeProducts } from '../js/products.js';
import { rawProducts } from './fixtures/products.js';
test('central state publishes transitions and derives filters without duplicate stored values', () => {
  const store = createStore({ products: normalizeProducts(rawProducts) });
  let changes = 0;
  const unsubscribe = store.subscribe(() => { changes++; });
  store.setState({ category: 'clothing', query: 'blue', sort: 'price-desc' });
  assert.deepEqual(visibleProducts(store.getState()).map(p=>p.id), [1]);
  assert.equal(store.getState().products.length, 4);
  unsubscribe();
  store.setState({ query: '' });
  assert.equal(changes, 1);
  assert.ok(Object.isFrozen(store.getState()));
});

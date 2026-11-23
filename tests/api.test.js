import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fetchProducts, PRODUCTS_URL } from '../js/api.js';

test('requests the real FakeStoreAPI endpoint with an abort signal', async () => {
  const result = await fetchProducts({ fetchImpl: async (url, options) => {
    assert.equal(url, PRODUCTS_URL);
    assert.ok(options.signal instanceof AbortSignal);
    return { ok: true, json: async () => [] };
  } });
  assert.deepEqual(result, []);
});
test('rejects HTTP failures and malformed JSON with friendly errors', async () => {
  await assert.rejects(fetchProducts({ fetchImpl: async () => ({ ok: false, status: 503 }) }), /HTTP 503/);
  await assert.rejects(fetchProducts({ fetchImpl: async () => ({ ok: true, json: async () => { throw new Error('bad JSON'); } }) }), /unreadable response/);
});
test('handles network failures', async () => {
  await assert.rejects(fetchProducts({ fetchImpl: async () => { throw new TypeError('offline'); } }), /could not reach/);
});
test('aborts requests that exceed the time limit', async () => {
  await assert.rejects(fetchProducts({ timeoutMs: 5, fetchImpl: (_, { signal }) => new Promise((_, reject) => signal.addEventListener('abort', () => reject(new Error('aborted')))) }), /too long/);
});

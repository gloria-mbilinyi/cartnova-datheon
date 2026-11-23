import assert from 'node:assert/strict';
import { test } from 'node:test';
import { loadCart, saveCart, parseCart, reconcileCart, CART_KEY } from '../js/cart-storage.js';
test('empty and corrupted storage recover safely', () => {
  assert.deepEqual(parseCart(null).items, []);
  for (const value of ['{', '{}', '{"version":2,"items":[]}', 'null']) assert.ok(parseCart(value).warning);
});
test('validates saved lines, merges duplicates and strips stored prices', () => {
  const result = parseCart(JSON.stringify({ version:1, items:[{productId:1,quantity:2,price:0}, {productId:1,quantity:98}, {productId:2,quantity:-1}, {productId:3,quantity:'4'}, {productId:0,quantity:1}] }));
  assert.deepEqual(result.items, [{productId:1,quantity:99}]);
  assert.ok(result.warning);
});
test('round-trips only product IDs and quantities', () => {
  let saved;
  const storage = { setItem: (key,value) => { assert.equal(key,CART_KEY); saved=value; }, getItem:()=>saved };
  assert.equal(saveCart([{productId:1,quantity:2,priceCents:1}],()=>storage), '');
  assert.deepEqual(loadCart(()=>storage).items, [{productId:1,quantity:2}]);
  assert.ok(!saved.includes('price'));
});
test('handles getter, read, write, and quota failures without throwing', () => {
  assert.ok(loadCart(()=>{throw new Error('denied');}).warning);
  assert.ok(loadCart(()=>({getItem(){throw new Error('denied');}})).warning);
  assert.ok(saveCart([],()=>({setItem(){throw new Error('quota');}})));
});
test('drops missing product IDs only against a verified current catalog', () => {
  assert.deepEqual(reconcileCart([{productId:1,quantity:2},{productId:9,quantity:1}], [{id:1}]), [{productId:1,quantity:2}]);
});

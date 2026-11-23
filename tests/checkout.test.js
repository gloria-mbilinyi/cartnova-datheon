import assert from 'node:assert/strict';
import { test } from 'node:test';
import { validateCheckout, createDemoOrder } from '../js/checkout.js';
import { normalizeProducts } from '../js/products.js';
import { rawProducts } from './fixtures/products.js';
const fields = {name:'Demo Shopper', email:'demo@example.com', address:'10 Example Street'};
const products = normalizeProducts(rawProducts);
test('simulated confirmation returns current totals and a reference without personal information', () => {
  const cart = [{productId:1,quantity:1}];
  const order = createDemoOrder({fields,cart,products,status:'ready'}, ()=>'DEMO-TEST1234');
  assert.equal(order.reference, 'DEMO-TEST1234');
  assert.equal(order.total, 5359);
  assert.equal(order.quantity, 1);
  assert.equal(JSON.stringify(order).includes('demo@example.com'), false);
  assert.equal(cart.length, 1);
});
test('checkout rejects empty bags, missing products and unverified prices', () => {
  for (const patch of [{cart:[]}, {status:'error'}, {products:[]}, {fields:{}}]) assert.throws(()=>createDemoOrder({fields,cart:[{productId:1,quantity:1}],products,status:'ready',...patch}));
});
test('validates required fields with useful errors', () => {
  assert.deepEqual(Object.keys(validateCheckout({})), ['name','email','address']);
  assert.ok(validateCheckout({name:'A',email:'missing-at',address:'short'}).email);
});
test('accepts complete customer fields without modifying or persisting them', () => {
  const fields = {name:' Gloria Mbilinyi ',email:'gloria@example.com',address:'DIT, Dar es Salaam'};
  assert.deepEqual(validateCheckout(fields), {});
  assert.equal(fields.name, ' Gloria Mbilinyi ');
});
test('rejects excessive fields, invalid email and whitespace-only input', () => {
  for (const fields of [{name:' '.repeat(4)}, {name:'x'.repeat(101)}, {email:'a@b'}, {email:'a b@example.com'}, {address:'x'.repeat(501)}]) assert.ok(Object.keys(validateCheckout(fields)).length);
});

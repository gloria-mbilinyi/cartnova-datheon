import assert from 'node:assert/strict';
import { test } from 'node:test';
import { validateCheckout } from '../js/checkout.js';
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

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readTheme } from '../js/theme.js';
test('theme preference supports saved values, system fallback, and unavailable storage', () => {
  assert.equal(readTheme(()=>({getItem:()=> 'dark'})), 'dark');
  assert.equal(readTheme(()=>({getItem:()=> 'invalid'}),true), 'dark');
  assert.equal(readTheme(()=>{throw new Error('blocked');}), 'light');
});

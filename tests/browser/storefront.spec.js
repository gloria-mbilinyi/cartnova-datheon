import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { rawProducts } from '../fixtures/products.js';
const endpoint = 'https://fakestoreapi.com/products';
const cards = page => page.locator('.product-card');
const card = (page,id) => page.locator(`.product-card[data-product-id="${id}"]`);
const bag = page => page.locator('#cart-dialog');
const add = (page,id=1) => card(page,id).getByRole('button',{name:/^Add .* to cart$/}).click();
const openBag = page => page.locator('#open-cart').click();
async function mock(page, data=rawProducts) {
  await page.route(endpoint, route => route.fulfill({json:data}));
  await page.route('https://example.test/**', route => route.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect x="50" y="40" width="100" height="120" fill="#5b3bd1"/></svg>'}));
}
async function visit(page) { await page.goto('./'); await expect(cards(page)).toHaveCount(4); }
async function checkout(page) { await openBag(page); await page.getByRole('button',{name:'Continue to demo checkout'}).click(); }
async function fillCheckout(page) {
  await page.getByLabel('Customer name').fill('Demo Shopper');
  await page.getByLabel('Email address').fill('demo@example.com');
  await page.getByLabel('Shipping address').fill('10 Example Street, Dar es Salaam');
}
test.beforeEach(async ({page}) => { await mock(page); });
test('loads product cards, authentic fields, ratings and deterministic badges', async ({page}) => {
  await visit(page);
  await expect(card(page,1)).toContainText('$44.99');
  await expect(card(page,1)).toContainText('4.6 / 5 (120)');
  await expect(page.locator('.product-badge')).toHaveCount(2);
  await expect(page.locator('#product-grid')).toHaveAttribute('aria-busy','false');
});
test('category navigation filters electronics and jewelry', async ({page}) => {
  await visit(page);
  await page.locator('.category-nav [data-category=electronics]').click();
  await expect(cards(page)).toHaveCount(1);
  await expect(card(page,2)).toBeVisible();
  await page.locator('.category-nav [data-category=jewelery]').click();
  await expect(card(page,3)).toBeVisible();
});
test('clothing groups both clothing categories and supports individual categories', async ({page}) => {
  await visit(page);
  await page.locator('.category-nav [data-category=clothing]').click();
  await expect(cards(page)).toHaveCount(2);
  await page.locator('#category-filters').getByRole('button',{name:"Women's",exact:true}).click();
  await expect(cards(page)).toHaveCount(1);
  await expect(card(page,4)).toBeVisible();
});
test('search matches descriptions and combines with category selection', async ({page}) => {
  await visit(page);
  await page.getByRole('searchbox').fill('BLUE');
  await expect(cards(page)).toHaveCount(2);
  await page.locator('.category-nav [data-category=clothing]').click();
  await expect(cards(page)).toHaveCount(1);
  await expect(card(page,1)).toBeVisible();
  await page.getByRole('searchbox').fill('not-a-product');
  await expect(page.getByText('No discoveries match yet')).toBeVisible();
  await page.getByRole('button',{name:'Clear search and filters'}).click();
  await expect(cards(page)).toHaveCount(4);
  await expect(page.getByRole('searchbox')).toHaveValue('');
});
test('all sorting options order the visible catalog correctly', async ({page}) => {
  await visit(page);
  for (const [order,ids] of [['price-asc',['3','4','1','2']],['price-desc',['2','1','4','3']],['rating',['3','1','2','4']],['name',['1','4','3','2']],['default',['1','2','3','4']]]) {
    await page.getByLabel('Sort by').selectOption(order);
    await expect.poll(()=>cards(page).evaluateAll(nodes=>nodes.map(n=>n.dataset.productId))).toEqual(ids);
  }
});
test('product details trap focus, close on Escape and restore focus', async ({page}) => {
  await visit(page);
  const trigger = card(page,1).getByRole('button',{name:'View Canvas backpack',exact:true});
  await trigger.click();
  await expect(page.getByRole('dialog',{name:'Canvas backpack'})).toBeVisible();
  await expect(page.locator('.detail-description')).toHaveText('A blue everyday bag');
  for(let i=0;i<8;i++) await page.keyboard.press('Tab');
  expect(await page.evaluate(()=>Boolean(document.activeElement.closest('#product-dialog')))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
});
test('adds from cards and details and updates the accessible bag counter', async ({page}) => {
  await visit(page); await add(page);
  await card(page,1).getByRole('button',{name:'View Canvas backpack',exact:true}).click();
  await page.getByRole('button',{name:'Add to shopping bag',exact:true}).click();
  await expect(page.locator('#cart-count')).toHaveText('2');
  await page.keyboard.press('Escape'); await openBag(page);
  await expect(bag(page).locator('.quantity-value')).toHaveText('2');
});
test('drawer quantity controls increment, decrement and remove at zero', async ({page}) => {
  await visit(page); await add(page); await openBag(page);
  await page.locator('#quantity-plus-1').click();
  await expect(bag(page).locator('.quantity-value')).toHaveText('2');
  await expect(page.locator('#quantity-plus-1')).toBeFocused();
  await page.locator('#quantity-minus-1').click();
  await expect(bag(page).locator('.quantity-value')).toHaveText('1');
  await page.locator('#quantity-minus-1').click();
  await expect(page.getByText('Room for a good find')).toBeVisible();
  await expect(page.locator('#cart-count')).toHaveText('0');
  await expect(bag(page).getByLabel('Close shopping bag')).toBeFocused();
  await expect(bag(page).locator('[data-total=total] dd')).toHaveText('$0.00');
});
test('remove button removes only its selected product', async ({page}) => {
  await visit(page); await add(page); await add(page,2); await openBag(page);
  await page.locator('#remove-1').click();
  await expect(bag(page).locator('.cart-line')).toHaveCount(1);
  await expect(bag(page)).toContainText('Wireless headphones');
  await expect(page.locator('#cart-count')).toHaveText('1');
});
test('calculates $5 shipping below $100 and matches checkout totals', async ({page}) => {
  await visit(page); await add(page); await openBag(page);
  for(const [key,value] of [['subtotal','$44.99'],['tax','$3.60'],['shipping','$5.00'],['total','$53.59']]) await expect(bag(page).locator(`[data-total=${key}] dd`)).toHaveText(value);
  await page.getByRole('button',{name:'Continue to demo checkout'}).click();
  await expect(page.locator('#checkout-dialog [data-total=total] dd')).toHaveText('$53.59');
});
test('free shipping applies at exactly $100 and quantity changes update all totals', async ({page}) => {
  await visit(page); await add(page); await add(page,2); await openBag(page);
  await expect(bag(page).locator('[data-total=subtotal] dd')).toHaveText('$100.00');
  await expect(bag(page).locator('[data-total=shipping] dd')).toHaveText('Free');
  await expect(bag(page).locator('[data-total=total] dd')).toHaveText('$108.00');
  await page.locator('#quantity-plus-1').click();
  await expect(bag(page).locator('[data-total=total] dd')).toHaveText('$156.59');
});
test('cart persists after reload using only versioned IDs and quantities', async ({page}) => {
  await visit(page); await add(page); await add(page);
  await page.reload(); await expect(cards(page)).toHaveCount(4); await openBag(page);
  await expect(bag(page).locator('.quantity-value')).toHaveText('2');
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('cartnova.cart.v1')))).toEqual({version:1,items:[{productId:1,quantity:2}]});
});
test('corrupted saved data produces a recoverable empty bag', async ({page}) => {
  await page.addInitScript(()=>localStorage.setItem('cartnova.cart.v1','{broken'));
  await visit(page); await openBag(page);
  await expect(page.locator('#storage-notice')).toContainText('could not be read');
  await expect(page.getByText('Room for a good find')).toBeVisible();
});
test('storage access failures leave a functional in-memory bag and visible notice', async ({page}) => {
  await page.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Denied','SecurityError');}}));
  await visit(page); await add(page); await openBag(page);
  await expect(bag(page).locator('.cart-line')).toHaveCount(1);
  await expect(page.locator('#storage-notice')).toContainText('could not be saved');
});
test('missing saved products are removed and saved prices are ignored', async ({page}) => {
  await page.addInitScript(()=>localStorage.setItem('cartnova.cart.v1',JSON.stringify({version:1,items:[{productId:999,quantity:2},{productId:1,quantity:1,priceCents:0}]})));
  await visit(page); await openBag(page);
  await expect(bag(page).locator('.cart-line')).toHaveCount(1);
  await expect(page.locator('#storage-notice')).toContainText('Unavailable products');
  await expect(bag(page).locator('[data-total=total] dd')).toHaveText('$53.59');
});
test('checkout validates fields and focuses the first error', async ({page}) => {
  await visit(page); await add(page); await checkout(page);
  await page.getByRole('button',{name:'Confirm demo order'}).click();
  await expect(page.getByLabel('Customer name')).toBeFocused();
  await expect(page.locator('#email-error')).toContainText('valid email');
  await expect(page.locator('#cart-count')).toHaveText('1');
});
test('simulates checkout, clears cart, excludes personal data and supports another order', async ({page}) => {
  const posts=[]; page.on('request',request=>{if(request.method()==='POST') posts.push(request.url());});
  await visit(page); await add(page); await checkout(page); await fillCheckout(page);
  await page.getByRole('button',{name:'Confirm demo order'}).click();
  await expect(page.locator('#confirmation-dialog')).toBeVisible();
  await expect(page.locator('#order-reference')).toContainText('DEMO-');
  await expect(page.locator('#order-total')).toContainText('$53.59');
  await expect(page.locator('#cart-count')).toHaveText('0');
  expect(await page.evaluate(()=>JSON.stringify(localStorage))).not.toContain('demo@example.com');
  expect(posts).toEqual([]);
  await page.getByRole('button',{name:'Continue discovering',exact:true}).click();
  await expect(page.locator('#open-cart')).toBeFocused();
  await add(page,2); await checkout(page); await fillCheckout(page);
  await expect(page.getByRole('button',{name:'Confirm demo order'})).toBeEnabled();
  await page.getByRole('button',{name:'Confirm demo order'}).click();
  await expect(page.locator('#confirmation-dialog')).toBeVisible();
});
test('cancelling checkout clears personal fields and retains the bag', async ({page}) => {
  await visit(page); await add(page); await checkout(page); await fillCheckout(page);
  await page.keyboard.press('Escape'); await checkout(page);
  await expect(page.getByLabel('Customer name')).toHaveValue('');
  await expect(page.locator('#cart-count')).toHaveText('1');
});
test('failed API preserves saved IDs, disables checkout and recovers with Retry', async ({page}) => {
  let attempts=0;
  await page.route(endpoint,route=>route.fulfill(++attempts===1?{status:503,body:'Unavailable'}:{json:rawProducts}));
  await page.addInitScript(()=>localStorage.setItem('cartnova.cart.v1',JSON.stringify({version:1,items:[{productId:1,quantity:1}]})));
  await page.goto('./');
  await expect(page.getByText(/product service returned HTTP 503/)).toBeVisible();
  await expect(cards(page)).toHaveCount(0); await openBag(page);
  await expect(page.getByRole('button',{name:'Continue to demo checkout'})).toBeDisabled();
  await expect(bag(page)).toContainText('Waiting for verified current price');
  await page.keyboard.press('Escape'); await page.getByRole('button',{name:'Try again',exact:true}).click();
  await expect(cards(page)).toHaveCount(4);
});
test('invalid API data shows an honest error without fallback products', async ({page}) => {
  await page.route(endpoint,route=>route.fulfill({json:{products:rawProducts}}));
  await page.goto('./'); await expect(page.getByText(/invalid product data/)).toBeVisible();
  await expect(cards(page)).toHaveCount(0);
});
test('failed product images load a local accessible fallback', async ({page}) => {
  await page.route('https://example.test/**',route=>route.abort());
  await visit(page);
  const image=card(page,1).locator('img');
  await expect(image).toHaveAttribute('data-fallback','true');
  await expect.poll(()=>image.evaluate(img=>img.complete&&img.naturalWidth>0)).toBe(true);
  await expect(image).toHaveAttribute('alt',/image unavailable/);
});
test('API text renders as text rather than executable markup', async ({page}) => {
  const data=structuredClone(rawProducts); data[0].title='<img src=x onerror="window.injected=true">'; data[0].description='<script>window.injected=true</script>';
  await page.route(endpoint,route=>route.fulfill({json:data})); await visit(page);
  await expect(card(page,1).locator('.product-title')).toHaveText(data[0].title);
  expect(await page.evaluate(()=>window.injected)).toBeUndefined();
  await expect(card(page,1).locator('script')).toHaveCount(0);
});
test('theme switching persists across reload', async ({page}) => {
  await visit(page); await page.getByRole('button',{name:'Switch to dark theme'}).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  await page.reload(); await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
});
test('quantity maximum disables increment without creating invalid totals', async ({page}) => {
  await page.addInitScript(()=>localStorage.setItem('cartnova.cart.v1',JSON.stringify({version:1,items:[{productId:1,quantity:99}]})));
  await visit(page); await openBag(page);
  await expect(page.locator('#quantity-plus-1')).toBeDisabled();
  await expect(bag(page).locator('[data-total=total] dd')).not.toContainText(/NaN|Infinity/);
});
test('cross-tab cart changes update open checkout and prevent an empty order', async ({page}) => {
  await visit(page); await add(page); await checkout(page);
  await page.evaluate(()=>window.dispatchEvent(new StorageEvent('storage',{key:'cartnova.cart.v1',newValue:JSON.stringify({version:1,items:[]})})));
  await expect(page.getByRole('button',{name:'Confirm demo order'})).toBeDisabled();
  await expect(page.locator('#checkout-summary')).toContainText('nonempty bag');
});
for(const width of [1440,768,390,320]) test(`responsive catalog and drawer have no horizontal overflow at ${width}px`,async ({page})=>{
  const errors=[]; page.on('pageerror',error=>errors.push(error.message));
  await page.setViewportSize({width,height:960}); await visit(page);
  if(width>800) await expect(page.locator('#filters-toggle')).toBeHidden();
  else await expect(page.locator('#filters-toggle')).toBeVisible();
  const overflow=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,nodes:[...document.querySelectorAll('body *')].filter(node=>node.getBoundingClientRect().right>innerWidth+1&&node.getBoundingClientRect().width>0).slice(0,12).map(node=>({tag:node.tagName,id:node.id,class:node.className?.baseVal??node.className,right:node.getBoundingClientRect().right}))}));
  expect(overflow.scroll,JSON.stringify(overflow)).toBeLessThanOrEqual(overflow.width);
  await add(page); await openBag(page);
  expect(await bag(page).evaluate(node=>node.scrollWidth<=node.clientWidth)).toBe(true);
  await page.keyboard.press('Escape');
  if(width<=768) { await page.locator('#filters-toggle').click(); await expect(page.locator('#category-filters')).toBeVisible(); }
  expect(errors).toEqual([]);
});
test('light storefront, cart and checkout pass automated accessibility rules',async ({page})=>{
  await visit(page);
  expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
  await add(page); await openBag(page);
  expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
  await page.getByRole('button',{name:'Continue to demo checkout'}).click();
  expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
});
test('dark storefront passes automated accessibility rules',async ({page})=>{
  await visit(page); await page.getByRole('button',{name:'Switch to dark theme'}).click();
  expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
});

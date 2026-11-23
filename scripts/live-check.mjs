import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeProducts } from '../js/products.js';
import { calculateTotal } from '../js/calculations.js';
import { money } from '../js/utils.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const baseURL = (process.env.CARTNOVA_BASE_URL || 'http://127.0.0.1:4373/').replace(/\/?$/, '/');
const destination = path.resolve(process.env.CARTNOVA_EVIDENCE_DIR || path.join(root, process.argv.includes('--screenshots') ? 'assets/screenshots' : 'test-results/live'));
await mkdir(destination, { recursive:true });
const browser = await chromium.launch({ channel:process.env.PLAYWRIGHT_CHANNEL || (process.platform === 'win32' ? 'chrome' : undefined) });
try {
  const page = await browser.newPage({ viewport:{width:1440,height:1100}, reducedMotion:'reduce' });
  const runtimeErrors = [];
  page.on('pageerror',error=>runtimeErrors.push(error.message));
  const apiPromise = page.waitForResponse(response=>response.url()==='https://fakestoreapi.com/products', {timeout:20000});
  const documentResponse = await page.goto(baseURL);
  assert.equal(documentResponse.status(),200);
  const api = await apiPromise;
  assert.equal(api.status(),200);
  const products = normalizeProducts(await api.json());
  assert.ok(products.length >= 2);
  await expect(page.locator('.product-card')).toHaveCount(products.length);
  await expect(page.locator(`.product-card[data-product-id="${products[0].id}"] .product-price`)).toHaveText(money(products[0].priceCents));
  await page.locator('.product-card img').evaluateAll(images=>images.forEach(image=>{image.loading='eager';}));
  await expect.poll(()=>page.locator('.product-card img').evaluateAll(images=>images.every(image=>image.complete&&image.naturalWidth>0)),{timeout:20000}).toBe(true);
  const widths=[];
  for(const [width,filename] of [[1440,'desktop.png'],[768,'tablet.png'],[390,'mobile.png'],[320,'narrow.png']]) {
    await page.setViewportSize({width,height:1100});
    await page.evaluate(()=>window.scrollTo(0,0));
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    const geometry=await page.evaluate(()=>({client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
    assert.ok(geometry.scroll<=geometry.client,`Overflow at ${width}px`);
    widths.push(width);
    await page.screenshot({path:path.join(destination,filename),fullPage:false});
  }
  await page.setViewportSize({width:1440,height:1100});
  await page.evaluate(()=>document.querySelector('#catalog').scrollIntoView());
  await page.screenshot({path:path.join(destination,'catalog.png')});
  const first=page.locator(`.product-card[data-product-id="${products[0].id}"]`);
  await first.locator('.product-image-button').click();
  await expect(page.locator('#product-dialog')).toBeVisible();
  await page.screenshot({path:path.join(destination,'details.png')});
  await page.keyboard.press('Escape');
  for(const product of products.slice(0,2)) await page.locator(`.product-card[data-product-id="${product.id}"] .add-button`).click();
  await expect(page.locator('#cart-count')).toHaveText('2');
  await page.reload();
  await expect(page.locator('.product-card')).toHaveCount(products.length);
  await expect(page.locator('#cart-count')).toHaveText('2');
  await page.locator('#open-cart').click();
  const totals=calculateTotal(products.slice(0,2).map(product=>({productId:product.id,quantity:1})),products);
  await expect(page.locator('#cart-dialog [data-total=total] dd')).toHaveText(money(totals.total));
  await page.screenshot({path:path.join(destination,'cart.png')});
  await page.getByRole('button',{name:'Continue to demo checkout'}).click();
  await expect(page.locator('#checkout-dialog [data-total=total] dd')).toHaveText(money(totals.total));
  await page.screenshot({path:path.join(destination,'checkout.png')});
  await page.getByLabel('Customer name').fill('Demo Shopper');
  await page.getByLabel('Email address').fill('demo@example.com');
  await page.getByLabel('Shipping address').fill('10 Example Street, Demo City');
  await page.getByRole('button',{name:'Confirm demo order'}).click();
  await expect(page.locator('#confirmation-dialog')).toBeVisible();
  await expect(page.locator('#cart-count')).toHaveText('0');
  await page.screenshot({path:path.join(destination,'confirmation.png')});
  assert.deepEqual(runtimeErrors,[]);
  let build=null;
  if(process.env.CARTNOVA_EXPECTED_SHA) {
    const response=await page.request.get(new URL('build-info.json',baseURL).href);
    assert.equal(response.status(),200);
    build=await response.json();
    assert.equal(build.commit,process.env.CARTNOVA_EXPECTED_SHA);
  }
  const evidence={url:baseURL,checkedAt:new Date().toISOString(),mocked:false,apiStatus:api.status(),productCount:products.length,firstProductId:products[0].id,firstProductPrice:money(products[0].priceCents),verifiedCartTotal:money(totals.total),widths,persistenceAfterReload:true,simulatedCheckout:true,cartCleared:true,imagesLoaded:true,runtimeErrors,browser:browser.version(),build};
  await writeFile(path.join(destination,'live-evidence.json'),JSON.stringify(evidence,null,2));
  console.log(JSON.stringify(evidence));
} finally { await browser.close(); }

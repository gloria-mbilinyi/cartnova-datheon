import { fetchProducts, PRODUCTS_URL } from '../js/api.js';
try {
  const products = await fetchProducts();
  if (!Array.isArray(products) || !products.length) throw new Error('No product array returned.');
  console.log(JSON.stringify({ endpoint: PRODUCTS_URL, result: 'success', productCount: products.length, checkedAt: new Date().toISOString() }));
} catch (error) {
  console.error(JSON.stringify({ endpoint: PRODUCTS_URL, result: 'failed', message: error.message, checkedAt: new Date().toISOString() }));
  process.exitCode = 1;
}

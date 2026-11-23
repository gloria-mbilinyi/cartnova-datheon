import { fetchProducts } from './api.js';
import { renderProducts } from './catalog.js';
import { catalogMessage, loadingGrid } from './ui.js';

let products = [];
export function renderCatalog() { renderProducts(products); }
export async function loadCatalog() {
  loadingGrid();
  try { products = await fetchProducts(); renderCatalog(); }
  catch (error) {
    document.querySelector('#product-grid').replaceChildren();
    document.querySelector('#product-grid').setAttribute('aria-busy', 'false');
    document.querySelector('#catalog-count').textContent = 'Collection unavailable';
    catalogMessage('A small pause in your discovery', error.message, 'Try again', loadCatalog);
  }
}
loadCatalog();

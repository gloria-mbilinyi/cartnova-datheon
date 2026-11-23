import { fetchProducts } from './api.js';
import { renderProducts } from './catalog.js';
import { catalogMessage, loadingGrid, initDialogs } from './ui.js';
import { showProductDetails } from './details.js';
import { filterCategory } from './filters.js';
import { searchProducts } from './search.js';
import { sortProducts } from './sorting.js';

let products = [];
let category = 'all';
let query = '';
let sort = 'default';
initDialogs();
export function renderCatalog() { renderProducts(sortProducts(searchProducts(filterCategory(products, category), query), sort), { onDetails: id => showProductDetails(products.find(product => product.id === id)) }); }
document.querySelector('#sort').addEventListener('change', event => { sort = event.target.value; renderCatalog(); });
document.querySelector('#search').addEventListener('input', event => { query = event.target.value; renderCatalog(); });
document.querySelector('#search-form').addEventListener('submit', event => {
  event.preventDefault();
  document.querySelector('#catalog').scrollIntoView({ block: 'start' });
  document.querySelector('#catalog').focus({ preventScroll: true });
});
document.querySelectorAll('[data-category]').forEach(control => control.addEventListener('click', () => {
  category = control.dataset.category;
  document.querySelectorAll('[data-category]').forEach(item => item.setAttribute('aria-pressed', String(item.dataset.category === category)));
  renderCatalog();
}));
document.querySelector('#filters-toggle').addEventListener('click', event => {
  const expanded = event.currentTarget.getAttribute('aria-expanded') !== 'true';
  event.currentTarget.setAttribute('aria-expanded', String(expanded));
  document.querySelector('#category-filters').classList.toggle('expanded', expanded);
});
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

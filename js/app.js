import { fetchProducts } from './api.js';
import { renderProducts } from './catalog.js';
import { catalogMessage, loadingGrid, initDialogs } from './ui.js';
import { showProductDetails } from './details.js';
import { createStore, visibleProducts } from './state.js';

const store = createStore();
let activeRequest;
initDialogs();
export function renderCatalog() {
  const state = store.getState();
  if (state.status !== 'ready') return;
  renderProducts(visibleProducts(state), { onDetails: id => showProductDetails(state.products.find(product => product.id === id)) });
}
store.subscribe((next, previous) => {
  if (['products', 'status', 'query', 'category', 'sort'].some(key => next[key] !== previous[key])) renderCatalog();
});
document.querySelector('#sort').addEventListener('change', event => store.setState({ sort: event.target.value }));
document.querySelector('#search').addEventListener('input', event => store.setState({ query: event.target.value }));
document.querySelector('#search-form').addEventListener('submit', event => {
  event.preventDefault();
  document.querySelector('#catalog').scrollIntoView({ block: 'start' });
  document.querySelector('#catalog').focus({ preventScroll: true });
});
document.querySelectorAll('[data-category]').forEach(control => control.addEventListener('click', () => {
  const category = control.dataset.category;
  document.querySelectorAll('[data-category]').forEach(item => item.setAttribute('aria-pressed', String(item.dataset.category === category)));
  store.setState({ category });
}));
document.querySelector('#filters-toggle').addEventListener('click', event => {
  const expanded = event.currentTarget.getAttribute('aria-expanded') !== 'true';
  event.currentTarget.setAttribute('aria-expanded', String(expanded));
  document.querySelector('#category-filters').classList.toggle('expanded', expanded);
});
export async function loadCatalog() {
  activeRequest?.abort();
  const request = new AbortController();
  activeRequest = request;
  store.setState({ status: 'loading', error: '' });
  loadingGrid();
  try {
    const products = await fetchProducts({ signal: request.signal });
    if (request.signal.aborted) return;
    store.setState({ products, status: 'ready' });
  }
  catch (error) {
    if (request.signal.aborted) return;
    store.setState({ status: 'error', error: error.message });
    document.querySelector('#product-grid').replaceChildren();
    document.querySelector('#product-grid').setAttribute('aria-busy', 'false');
    document.querySelector('#catalog-count').textContent = 'Collection unavailable';
    catalogMessage('A small pause in your discovery', error.message, 'Try again', loadCatalog);
  }
}
loadCatalog();

import { fetchProducts } from './api.js';
import { renderProducts } from './catalog.js';
import { catalogMessage, loadingGrid, initDialogs, notify } from './ui.js';
import { addToCart, cartCount, MAX_QUANTITY } from './cart.js';
import { loadCart, saveCart, reconcileCart } from './cart-storage.js';
import { showProductDetails } from './details.js';
import { createStore, visibleProducts } from './state.js';

const savedCart = loadCart();
const store = createStore({ cart: savedCart.items, storageWarning: savedCart.warning });
document.querySelector('#cart-count').textContent = cartCount(savedCart.items);
let activeRequest;
initDialogs();
function addProduct(id) {
  const state = store.getState();
  if (state.status !== 'ready') return notify('Wait for current product prices before adding items.');
  const atLimit = state.cart.find(item => item.productId === id)?.quantity === MAX_QUANTITY;
  store.setState({ cart: addToCart(state.cart, id, state.products) });
  notify(atLimit ? 'Maximum quantity is 99 per item.' : 'Added to your shopping bag.');
}
export function renderCatalog() {
  const state = store.getState();
  if (state.status !== 'ready') return;
  renderProducts(visibleProducts(state), { onAdd: addProduct, onDetails: id => showProductDetails(state.products.find(product => product.id === id), addProduct) });
}
store.subscribe((next, previous) => {
  if (next.cart !== previous.cart) {
    document.querySelector('#cart-count').textContent = cartCount(next.cart);
    const warning = saveCart(next.cart);
    if (warning) store.setState({ storageWarning: warning });
  }
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
    const previousCart = store.getState().cart;
    const cart = reconcileCart(previousCart, products);
    const missingWarning = cart.length < previousCart.length ? 'Unavailable products were removed from your saved bag.' : store.getState().storageWarning;
    store.setState({ products, status: 'ready', cart, storageWarning: missingWarning });
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

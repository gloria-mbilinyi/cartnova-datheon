import { fetchProducts } from './api.js';
import { renderProducts } from './catalog.js';
import { catalogMessage, loadingGrid, initDialogs, notify, openDialog } from './ui.js';
import { addToCart, removeFromCart, updateQuantity, cartCount, MAX_QUANTITY } from './cart.js';
import { renderCart } from './cart-view.js';
import { renderCheckout, clearCheckoutForm } from './checkout-view.js';
import { validateCheckout, createDemoOrder } from './checkout.js';
import { money } from './utils.js';
import { initTheme } from './theme.js';
import { loadCart, saveCart, reconcileCart, parseCart, CART_KEY } from './cart-storage.js';
import { showProductDetails } from './details.js';
import { createStore, visibleProducts } from './state.js';

const savedCart = loadCart();
const store = createStore({ cart: savedCart.items, storageWarning: savedCart.warning });
document.querySelector('#cart-count').textContent = cartCount(savedCart.items);
document.querySelector('#open-cart').setAttribute('aria-label', `Open shopping bag, ${cartCount(savedCart.items)} items`);
let activeRequest;
initDialogs();
initTheme();
const cartHandlers = {
  onCheckout: () => {
    clearCheckoutForm();
    if (renderCheckout(store.getState())) openDialog(document.querySelector('#checkout-dialog'));
  },
  onRemove: id => { store.setState({ cart: removeFromCart(store.getState().cart, id) }); notify('Item removed from your bag.'); },
  onQuantity: (id, quantity) => { store.setState({ cart: updateQuantity(store.getState().cart, id, quantity) }); notify(quantity ? 'Bag quantity updated.' : 'Item removed from your bag.'); },
};
document.querySelector('#checkout-dialog').addEventListener('close', clearCheckoutForm);
document.querySelectorAll('#checkout-form input, #checkout-form textarea').forEach(input => input.addEventListener('input', () => {
  input.removeAttribute('aria-invalid');
  document.querySelector(`#${input.name}-error`).textContent = '';
  document.querySelector('#checkout-error').textContent = '';
}));
document.querySelector('#checkout-form').addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget;
  const fields = Object.fromEntries(new FormData(form));
  const errors = validateCheckout(fields);
  for (const key of ['name', 'email', 'address']) {
    document.querySelector(`#${key}-error`).textContent = errors[key] || '';
    form.elements.namedItem(key).setAttribute('aria-invalid', String(Boolean(errors[key])));
  }
  if (Object.keys(errors).length) {
    form.elements.namedItem(Object.keys(errors)[0]).focus();
    return;
  }
  try {
    const order = createDemoOrder({ fields, ...store.getState() });
    document.querySelector('#order-reference').textContent = `Demo reference: ${order.reference}`;
    document.querySelector('#order-total').textContent = `${order.quantity} item${order.quantity === 1 ? '' : 's'} · Simulated total ${money(order.total)}`;
    store.setState({ cart: [] });
    clearCheckoutForm();
    openDialog(document.querySelector('#confirmation-dialog'));
  } catch (error) {
    document.querySelector('#checkout-error').textContent = error.message;
  }
});
document.querySelector('#open-cart').addEventListener('click', () => {
  renderCart(store.getState(), cartHandlers);
  openDialog(document.querySelector('#cart-dialog'));
});
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
  const visible = visibleProducts(state);
  renderProducts(visible, { onAdd: addProduct, onDetails: id => showProductDetails(state.products.find(product => product.id === id), addProduct) });
  const summary = document.querySelector('#filter-summary');
  summary.textContent = state.query.trim() ? `Results for “${state.query.trim()}”` : '';
  summary.hidden = !state.query.trim();
  if (!visible.length) catalogMessage(state.products.length ? 'No discoveries match yet' : 'The collection is empty', state.products.length ? 'Try a different search or explore another category.' : 'The product service returned no products. Try loading the collection again.', state.products.length ? 'Clear search and filters' : 'Reload collection', state.products.length ? () => store.setState({ query: '', category: 'all' }) : loadCatalog);
}
store.subscribe((next, previous) => {
  document.querySelectorAll('[data-category]').forEach(control => control.setAttribute('aria-pressed', String(control.dataset.category === next.category)));
  if (document.querySelector('#search').value !== next.query) document.querySelector('#search').value = next.query;
  if (['cart', 'status', 'storageWarning'].some(key => next[key] !== previous[key])) renderCart(next, cartHandlers);
  if (document.querySelector('#checkout-dialog').open && ['cart', 'status'].some(key => next[key] !== previous[key])) {
    const available = renderCheckout(next);
    document.querySelector('#checkout-form button[type=submit]').disabled = !available;
  }
  if (next.cart !== previous.cart) {
    document.querySelector('#cart-count').textContent = cartCount(next.cart);
    document.querySelector('#open-cart').setAttribute('aria-label', `Open shopping bag, ${cartCount(next.cart)} items`);
    const warning = saveCart(next.cart);
    if (warning) store.setState({ storageWarning: warning });
  }
  if (['products', 'status', 'query', 'category', 'sort'].some(key => next[key] !== previous[key])) renderCatalog();
});
window.addEventListener('storage', event => {
  if (event.key !== CART_KEY && event.key !== null) return;
  const restored = parseCart(event.key === null ? null : event.newValue);
  const state = store.getState();
  store.setState({ cart: state.status === 'ready' ? reconcileCart(restored.items, state.products) : restored.items, storageWarning: restored.warning });
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

import { button, el, money, productImage } from './utils.js';
import { MAX_QUANTITY } from './cart.js';
import { calculateTotal } from './calculations.js';
import { totalsView } from './totals-view.js';
export function renderCart(state, handlers) {
  const activeId = document.activeElement?.id;
  const container = document.querySelector('#cart-items');
  const summary = document.querySelector('#cart-summary');
  const notice = document.querySelector('#storage-notice');
  notice.textContent = state.storageWarning;
  notice.hidden = !state.storageWarning;
  container.replaceChildren();
  summary.replaceChildren();
  if (!state.cart.length) {
    const empty = el('div', 'empty-bag');
    empty.append(el('span', 'empty-bag-icon', '◇'), el('h3', '', 'Room for a good find'), el('p', '', 'Your shopping bag is empty. Explore the collection and find something you love.'), button('Continue discovering', 'button primary', () => document.querySelector('#cart-dialog').close()));
    container.append(empty);
    summary.append(totalsView(calculateTotal([], state.products)));
    if (activeId && document.querySelector('#cart-dialog').open) document.querySelector('#cart-dialog .close-button').focus();
    return;
  }
  for (const item of state.cart) {
    const product = state.products.find(product => product.id === item.productId);
    const line = el('article', 'cart-line');
    line.dataset.productId = item.productId;
    if (product) line.append(productImage(product, 'cart-image'));
    const body = el('div', 'cart-line-body');
    body.append(el('h3', '', product?.title || `Saved product #${item.productId}`));
    body.append(el('p', 'cart-unit-price', state.status === 'ready' && product ? `${money(product.priceCents)} each` : 'Waiting for verified current price'));
    const controls = el('div', 'quantity-controls');
    const minus = button('−', '', () => handlers.onQuantity(item.productId, item.quantity - 1));
    minus.id = `quantity-minus-${item.productId}`;
    minus.setAttribute('aria-label', item.quantity === 1 ? `Remove ${product?.title || 'item'} by decreasing quantity` : `Decrease quantity of ${product?.title || 'item'}`);
    const count = el('span', 'quantity-value', item.quantity);
    count.setAttribute('aria-label', `Quantity: ${item.quantity}`);
    const plus = button('+', '', () => handlers.onQuantity(item.productId, item.quantity + 1));
    plus.id = `quantity-plus-${item.productId}`;
    plus.setAttribute('aria-label', `Increase quantity of ${product?.title || 'item'}`);
    plus.disabled = item.quantity >= MAX_QUANTITY || state.status !== 'ready';
    controls.append(minus, count, plus);
    const remove = button('Remove', 'remove-button', () => handlers.onRemove(item.productId));
    remove.id = `remove-${item.productId}`;
    remove.setAttribute('aria-label', `Remove ${product?.title || 'item'} from cart`);
    const bottom = el('div', 'cart-line-bottom');
    bottom.append(controls, remove);
    body.append(bottom);
    if (state.status === 'ready' && product) body.append(el('p', 'line-total', `Line total: ${money(product.priceCents * item.quantity)}`));
    line.append(body);
    container.append(line);
  }
  container.append(el('p', 'form-note', 'Maximum 99 per item. At quantity 1, − removes the item.'));
  if (state.status === 'ready') {
    summary.append(totalsView(calculateTotal(state.cart, state.products)));
  }
  summary.append(el('p', 'form-note', state.status === 'ready' ? 'Demo totals use current FakeStoreAPI prices.' : 'Current prices are unavailable. Checkout is disabled until the catalog is verified.'));
  const checkout = button('Continue to demo checkout', 'button primary full-width', handlers.onCheckout);
  checkout.disabled = state.status !== 'ready';
  summary.append(checkout);
  if (activeId && document.querySelector('#cart-dialog').open) (document.getElementById(activeId) || document.querySelector('#cart-dialog .close-button')).focus();
}

import { calculateTotal, resolveCartLines } from './calculations.js';
import { totalsView } from './totals-view.js';
import { el, money } from './utils.js';
export function renderCheckout(state) {
  const region = document.querySelector('#checkout-summary');
  region.replaceChildren();
  if (state.status !== 'ready' || !state.cart.length) {
    region.append(el('p', 'notice', 'A nonempty bag and verified current prices are required.'));
    return false;
  }
  const list = el('ul', 'checkout-items');
  for (const line of resolveCartLines(state.cart, state.products)) {
    const item = el('li');
    item.append(el('span', '', `${line.product.title} × ${line.quantity}`), el('strong', '', money(line.lineTotal)));
    list.append(item);
  }
  region.append(list, totalsView(calculateTotal(state.cart, state.products)));
  return true;
}
export function clearCheckoutForm() {
  document.querySelector('#checkout-form').reset();
  document.querySelectorAll('#checkout-form input, #checkout-form textarea').forEach(input => input.removeAttribute('aria-invalid'));
  document.querySelectorAll('#checkout-form .field-error').forEach(error => { error.textContent = ''; });
}

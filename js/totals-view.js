import { el, money } from './utils.js';
import { POLICY_TEXT } from './calculations.js';
export function totalsView(totals) {
  const wrapper = el('div', 'totals-wrapper');
  const list = el('dl', 'totals');
  for (const [key, label] of [['subtotal','Subtotal'],['tax','Demo tax (8%)'],['shipping','Demo shipping'],['total','Total']]) {
    const row = el('div', `totals-row${key === 'total' ? ' grand-total' : ''}`);
    row.dataset.total = key;
    row.append(el('dt', '', label), el('dd', '', key === 'shipping' && totals.shipping === 0 ? 'Free' : money(totals[key])));
    list.append(row);
  }
  wrapper.append(list, el('p', 'policy', POLICY_TEXT));
  return wrapper;
}

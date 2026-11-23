import { button, el } from './utils.js';
let toastTimer;
export function notify(message) {
  const toast = document.querySelector('#toast');
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.hidden = true; }, 3500);
}
export function catalogMessage(title, description, actionLabel, action) {
  const region = document.querySelector('#catalog-message');
  region.replaceChildren(el('h3', '', title), el('p', '', description));
  if (action) region.append(button(actionLabel, 'button primary', action));
  region.hidden = false;
}
export function loadingGrid() {
  const grid = document.querySelector('#product-grid');
  grid.setAttribute('aria-busy', 'true');
  grid.replaceChildren(...Array.from({ length: 8 }, () => { const card = el('div', 'skeleton'); card.setAttribute('aria-hidden', 'true'); return card; }));
  document.querySelector('#catalog-message').hidden = true;
  document.querySelector('#catalog-count').textContent = 'Loading collection…';
}

import { button, el } from './utils.js';
const returnFocus = new WeakMap();
export function openDialog(dialog) {
  returnFocus.set(dialog, document.activeElement);
  document.querySelectorAll('dialog[open]').forEach(open => open.close());
  dialog.showModal();
}
export function initDialogs() {
  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.querySelectorAll('[data-close]').forEach(control => control.addEventListener('click', () => dialog.close()));
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const box = dialog.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
    });
    dialog.addEventListener('close', () => requestAnimationFrame(() => {
      if (document.querySelector('dialog[open]')) return;
      const trigger = returnFocus.get(dialog);
      (trigger?.isConnected ? trigger : document.querySelector('#open-cart')).focus();
    }));
  });
}
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

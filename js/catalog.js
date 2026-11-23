import { CATEGORY_NAMES } from './products.js';
import { button, el, money, productImage } from './utils.js';
export function productCard(product, { onDetails, onAdd } = {}) {
  const card = el('article', 'product-card');
  card.dataset.productId = product.id;
  const visual = el('div', 'product-visual');
  const imageButton = button('', 'product-image-button', () => onDetails?.(product.id));
  imageButton.setAttribute('aria-label', `View ${product.title}`);
  imageButton.append(productImage(product));
  visual.append(imageButton);
  if (product.rating.rate >= 4.5) visual.append(el('span', 'product-badge', 'Highly rated'));
  const body = el('div', 'product-body');
  const heading = el('h3', 'product-title');
  heading.append(button(product.title, '', () => onDetails?.(product.id)));
  const rating = el('p', 'product-rating');
  const star = el('span', 'rating-star', '★ ');
  star.setAttribute('aria-hidden', 'true');
  rating.append(star, document.createTextNode(`${product.rating.rate.toFixed(1)} / 5 (${product.rating.count})`));
  rating.setAttribute('aria-label', `Rated ${product.rating.rate} out of 5 from ${product.rating.count} ratings`);
  const bottom = el('div', 'product-bottom');
  const add = button('+ Add', 'add-button', () => onAdd?.(product.id));
  add.setAttribute('aria-label', `Add ${product.title} to cart`);
  bottom.append(el('span', 'product-price', money(product.priceCents)), add);
  body.append(el('p', 'product-category', CATEGORY_NAMES[product.category]), heading, el('p', 'product-description', product.description), rating, bottom);
  card.append(visual, body);
  return card;
}
export function renderProducts(products, handlers) {
  const grid = document.querySelector('#product-grid');
  grid.replaceChildren(...products.map(product => productCard(product, handlers)));
  grid.setAttribute('aria-busy', 'false');
  document.querySelector('#catalog-count').textContent = `${products.length} ${products.length === 1 ? 'product' : 'products'}`;
  document.querySelector('#catalog-message').hidden = true;
}

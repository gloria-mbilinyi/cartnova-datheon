import { CATEGORY_NAMES } from './products.js';
import { button, el, money, productImage } from './utils.js';
import { openDialog } from './ui.js';
export function showProductDetails(product, onAdd) {
  const content = document.querySelector('#product-detail');
  const image = productImage(product, 'detail-image');
  image.loading = 'eager';
  const body = el('div', 'detail-body');
  const title = el('h2', '', product.title);
  title.id = 'product-dialog-title';
  const add = button('Add to shopping bag', 'button primary full-width', () => onAdd?.(product.id));
  body.append(el('p', 'eyebrow', CATEGORY_NAMES[product.category]), title,
    el('p', 'product-rating', `★ ${product.rating.rate.toFixed(1)} / 5 · ${product.rating.count} ratings`),
    el('p', 'detail-description', product.description), el('p', 'detail-price', money(product.priceCents)), add);
  content.replaceChildren(image, body);
  openDialog(document.querySelector('#product-dialog'));
}

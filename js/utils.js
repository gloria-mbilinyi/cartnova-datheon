export const money = cents => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
export function el(tag, className = '', text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = String(text);
  return node;
}
export function button(label, className, action) {
  const node = el('button', className, label);
  node.type = 'button';
  if (action) node.addEventListener('click', action);
  return node;
}
export function productImage(product, className = '') {
  const image = el('img', className);
  image.src = product.image;
  image.alt = product.title;
  image.loading = 'lazy';
  image.decoding = 'async';
  image.addEventListener('error', () => {
    image.src = new URL('../assets/icons/product-placeholder.svg', import.meta.url).href;
    image.alt = `${product.title} — image unavailable`;
    image.dataset.fallback = 'true';
  }, { once: true });
  return image;
}

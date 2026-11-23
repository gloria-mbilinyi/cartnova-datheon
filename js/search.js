import { CATEGORY_NAMES } from './products.js';
const normalize = text => text.normalize('NFKC').toLocaleLowerCase('en-US');
export function searchProducts(products, query = '') {
  const words = normalize(query.trim()).split(/\s+/).filter(Boolean);
  return products.filter(product => {
    const content = normalize(`${product.title} ${product.description} ${CATEGORY_NAMES[product.category]}`);
    return words.every(word => content.includes(word));
  });
}

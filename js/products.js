export const CATEGORY_NAMES = Object.freeze({ electronics: 'Electronics', jewelery: 'Jewelry', "men's clothing": "Men's Clothing", "women's clothing": "Women's Clothing" });
function validImage(value) {
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password; }
  catch { return false; }
}
/** Validate external data once; all monetary state thereafter uses integer cents. */
export function normalizeProducts(data) {
  if (!Array.isArray(data) || data.length > 1000) throw new TypeError('Invalid product catalog.');
  const ids = new Set();
  return data.map(product => {
    if (!product || typeof product !== 'object' || !Number.isSafeInteger(product.id) || product.id < 1 || ids.has(product.id)
      || typeof product.title !== 'string' || !product.title.trim() || product.title.length > 500
      || typeof product.description !== 'string' || product.description.length > 10000
      || !Object.hasOwn(CATEGORY_NAMES, product.category)
      || typeof product.price !== 'number' || !Number.isFinite(product.price) || product.price < 0 || product.price > 1000000
      || typeof product.image !== 'string' || !validImage(product.image)
      || !product.rating || typeof product.rating.rate !== 'number' || !Number.isFinite(product.rating.rate) || product.rating.rate < 0 || product.rating.rate > 5
      || !Number.isSafeInteger(product.rating.count) || product.rating.count < 0) throw new TypeError('The product catalog contains invalid or duplicate product data.');
    ids.add(product.id);
    return Object.freeze({ id: product.id, title: product.title.trim(), description: product.description.trim(), category: product.category,
      image: product.image, priceCents: Math.round((product.price + Number.EPSILON) * 100), rating: Object.freeze({ rate: product.rating.rate, count: product.rating.count }) });
  });
}

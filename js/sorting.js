export function sortProducts(products, order = 'default') {
  const comparators = { 'price-asc': (a,b) => a.priceCents-b.priceCents, 'price-desc': (a,b) => b.priceCents-a.priceCents, rating: (a,b) => b.rating.rate-a.rating.rate, name: (a,b) => a.title.localeCompare(b.title, 'en', { sensitivity: 'base' }) };
  return comparators[order] ? [...products].sort(comparators[order]) : [...products];
}

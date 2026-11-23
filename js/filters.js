export function filterCategory(products, category = 'all') {
  if (category === 'all') return [...products];
  if (category === 'clothing') return products.filter(product => ["men's clothing", "women's clothing"].includes(product.category));
  return products.filter(product => product.category === category);
}

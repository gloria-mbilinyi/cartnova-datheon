import { filterCategory } from './filters.js';
import { searchProducts } from './search.js';
import { sortProducts } from './sorting.js';
export function createStore(initial = {}) {
  let state = Object.freeze({ products: [], status: 'idle', error: '', query: '', category: 'all', sort: 'default', cart: [], storageWarning: '', ...initial });
  const listeners = new Set();
  return {
    getState: () => state,
    setState(patch) {
      const previous = state;
      state = Object.freeze({ ...state, ...patch });
      listeners.forEach(listener => listener(state, previous));
    },
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
  };
}
export function visibleProducts(state) {
  return sortProducts(searchProducts(filterCategory(state.products, state.category), state.query), state.sort);
}

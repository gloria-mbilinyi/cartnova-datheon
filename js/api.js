import { normalizeProducts } from './products.js';
export const PRODUCTS_URL = 'https://fakestoreapi.com/products';

export class CatalogError extends Error {
  constructor(message, kind) { super(message); this.name = 'CatalogError'; this.kind = kind; }
}

export async function fetchProducts({ fetchImpl = globalThis.fetch, timeoutMs = 12000, signal } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(PRODUCTS_URL, {
      signal: signal ? AbortSignal.any([controller.signal, signal]) : controller.signal,
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    if (!response.ok) throw new CatalogError(`The product service returned HTTP ${response.status}. Please try again.`, 'http');
    let payload;
    try { payload = await response.json(); }
    catch (error) {
      if (controller.signal.aborted) throw error;
      throw new CatalogError('The product service sent an unreadable response. Please try again.', 'response');
    }
    try { return normalizeProducts(payload); }
    catch { throw new CatalogError('The product service sent invalid product data. Please try again.', 'schema'); }
  } catch (error) {
    if (error instanceof CatalogError) throw error;
    if (controller.signal.aborted) throw new CatalogError('The product service took too long to respond. Please try again.', 'timeout');
    if (signal?.aborted) throw new CatalogError('The product request was cancelled.', 'cancelled');
    throw new CatalogError('We could not reach the product service. Check your connection and try again.', 'network');
  } finally { clearTimeout(timer); }
}

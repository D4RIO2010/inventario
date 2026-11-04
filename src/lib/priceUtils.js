// Helper utilities for managing Cost Price and Selling Price (PVP)

const COST_CACHE_PREFIX = 'taller_aragua_cost_';

export function getCachedCostPrice(productId) {
  if (typeof window === 'undefined' || !productId) return 0;
  try {
    const cached = localStorage.getItem(`${COST_CACHE_PREFIX}${productId}`);
    return cached !== null ? parseFloat(cached) : 0;
  } catch {
    return 0;
  }
}

export function setCachedCostPrice(productId, costPrice) {
  if (typeof window === 'undefined' || !productId) return;
  try {
    localStorage.setItem(`${COST_CACHE_PREFIX}${productId}`, String(costPrice));
  } catch (e) {
    console.error('Error saving cached cost price:', e);
  }
}

/**
 * Ensures a product has clean, numeric cost_price, selling_price, and price.
 */
export function hydrateProduct(product) {
  if (!product) return product;

  // Selling price resolution (prioritize selling_price, fallback to price)
  let sellingPrice = 0;
  if (product.selling_price !== undefined && product.selling_price !== null) {
    sellingPrice = parseFloat(product.selling_price) || 0;
  } else if (product.price !== undefined && product.price !== null) {
    sellingPrice = parseFloat(product.price) || 0;
  }

  // Cost price resolution (prioritize cost_price, fallback to cached, fallback to estimated or 0)
  let costPrice = 0;
  if (product.cost_price !== undefined && product.cost_price !== null) {
    costPrice = parseFloat(product.cost_price) || 0;
  } else {
    const cached = getCachedCostPrice(product.id);
    if (cached > 0) {
      costPrice = cached;
    } else {
      // Default initial cost estimation if not provided (e.g. 65% of selling price)
      costPrice = sellingPrice > 0 ? parseFloat((sellingPrice * 0.65).toFixed(2)) : 0;
    }
  }

  return {
    ...product,
    cost_price: costPrice,
    selling_price: sellingPrice,
    price: sellingPrice, // maintained for backwards compatibility
  };
}

/**
 * Hydrates an array of products.
 */
export function hydrateProducts(products = []) {
  return products.map(hydrateProduct);
}

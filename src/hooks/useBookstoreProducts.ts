import { useEffect, useState } from 'react';
import { BOOKSTORE_SERVER_KEYS } from '../config/bookstoreCatalog';
import {
  COMMERCE_PRODUCTS_UPDATED_EVENT,
  getCommerceProductsByKeys,
} from '../lib/commerceProductsService';
import type { CommerceProduct } from '../types/commerce';

type BookstoreProductsState = {
  products: Record<string, CommerceProduct>;
  loading: boolean;
  error: Error | null;
};

export function useBookstoreProducts(): BookstoreProductsState {
  const [state, setState] = useState<BookstoreProductsState>({
    products: {},
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setState((current) => ({ ...current, loading: true, error: null }));
      try {
        const rows = await getCommerceProductsByKeys(BOOKSTORE_SERVER_KEYS);
        if (cancelled) return;
        const products = Object.fromEntries(rows.map((product) => [product.key, product]));
        setState({ products, loading: false, error: null });
      } catch (error) {
        if (!cancelled) {
          setState({ products: {}, loading: false, error: error as Error });
        }
      }
    };

    void load();
    window.addEventListener(COMMERCE_PRODUCTS_UPDATED_EVENT, load);
    return () => {
      cancelled = true;
      window.removeEventListener(COMMERCE_PRODUCTS_UPDATED_EVENT, load);
    };
  }, []);

  return state;
}

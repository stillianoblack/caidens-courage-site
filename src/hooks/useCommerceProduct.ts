import { useEffect, useState } from 'react';
import {
  COMMERCE_PRODUCTS_UPDATED_EVENT,
  getCommerceProduct,
} from '../lib/commerceProductsService';
import type { CommerceProduct, CommerceProductKey } from '../types/commerce';

type CommerceProductState = {
  product: CommerceProduct | null;
  loading: boolean;
  error: Error | null;
};

export function useCommerceProduct(key: CommerceProductKey): CommerceProductState {
  const [state, setState] = useState<CommerceProductState>({
    product: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    const load = async (forceRefresh = false) => {
      setState((current) => ({ ...current, loading: true, error: null }));
      try {
        const product = await getCommerceProduct(key, { forceRefresh });
        if (!cancelled) {
          setState({ product, loading: false, error: null });
        }
      } catch (error) {
        if (!cancelled) {
          setState({ product: null, loading: false, error: error as Error });
        }
      }
    };

    void load();

    const handleUpdate = () => void load(true);
    window.addEventListener(COMMERCE_PRODUCTS_UPDATED_EVENT, handleUpdate);

    return () => {
      cancelled = true;
      window.removeEventListener(COMMERCE_PRODUCTS_UPDATED_EVENT, handleUpdate);
    };
  }, [key]);

  return state;
}

'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { OrderType, ProductId } from '../data/products';

// Replaces the original "vb:order" custom DOM event.
// Product cards / the subscription button call chooseProduct(id);
// the order form reads orderType and reacts to focusTick.
type OrderValue = {
  orderType: OrderType;
  setOrderType: (value: OrderType) => void;
  focusTick: number;
  chooseProduct: (id: ProductId) => void;
};

const OrderContext = createContext<OrderValue | null>(null);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orderType, setOrderType] = useState<OrderType>('one-time');
  const [focusTick, setFocusTick] = useState(0);

  const chooseProduct = useCallback((id: ProductId) => {
    setOrderType(id);
    setFocusTick((n) => n + 1); // the form watches this to focus the phone field
  }, []);

  const value = useMemo(
    () => ({ orderType, setOrderType, focusTick, chooseProduct }),
    [orderType, focusTick, chooseProduct],
  );
  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrder(): OrderValue {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error('useOrder must be used inside <OrderProvider>');
  return ctx;
}

'use client';

import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { I18nProvider } from '../i18n';
import { OrderProvider } from '../context/OrderContext';
import { getAttribution } from '../lib/attribution';

// layout.tsx and page.tsx are Server Components: they can't hold state or use hooks.
// This one client component wraps everything that needs React context.
export default function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    getAttribution(); // capture UTM / gclid / referrer on the very first load
  }, []);

  return (
    <I18nProvider>
      <OrderProvider>{children}</OrderProvider>
    </I18nProvider>
  );
}

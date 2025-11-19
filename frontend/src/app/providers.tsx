'use client';

import { ReactNode, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from '../store';

// Dynamically import wallet providers to avoid SSR issues
const DynamicWalletProviders = dynamic(
  () => import('../components/DynamicWalletProviders').then(mod => ({ default: mod.DynamicWalletProviders })),
  {
    ssr: false,
    loading: () => <div>Loading wallet connection...</div>
  }
);

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ReduxProvider store={store}>
      <Suspense fallback={<div>Loading...</div>}>
        <DynamicWalletProviders>
          {children}
        </DynamicWalletProviders>
      </Suspense>
    </ReduxProvider>
  );
}
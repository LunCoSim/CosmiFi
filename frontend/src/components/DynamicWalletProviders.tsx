'use client';

import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from '../config/wagmi';
import { ReactNode, useEffect, useState } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from '../store';
import { WalletProvider } from '../contexts/WalletContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 30 * 1000, // 30 seconds
      retry: 2,
    },
  },
});

interface DynamicWalletProvidersProps {
  children: ReactNode;
}

export function DynamicWalletProviders({ children }: DynamicWalletProvidersProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <>{children}</>;
  }

  return (
    <ReduxProvider store={store}>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <WalletProvider>
            <RainbowKitProvider
              appInfo={{
                appName: 'CosmiFi',
                disclaimer: ({ Text, Link }) => (
                  <Text>
                    CosmiFi runs on Base Sepolia testnet. Please ensure your wallet is connected to Base Sepolia.
                  </Text>
                ),
              }}
              showRecentTransactions={true}
            >
              {children}
            </RainbowKitProvider>
          </WalletProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ReduxProvider>
  );
}
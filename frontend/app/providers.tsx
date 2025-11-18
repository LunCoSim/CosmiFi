'use client';

import { config } from '../src/config/wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { WagmiProvider } from 'wagmi';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from '../src/store';
import { WalletProvider } from '../src/contexts/WalletContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 30 * 1000, // 30 seconds
      retry: 2,
    },
  },
});

export function Providers({ children }: { children: ReactNode }) {
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
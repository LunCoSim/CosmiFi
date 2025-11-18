'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAccount, useDisconnect, useConnect } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';

interface WalletContextType {
  isConnected: boolean;
  address?: `0x${string}`;
  isConnecting: boolean;
  isReconnecting: boolean;
  disconnect: () => void;
  reconnect: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const { address, isConnected, connector } = useAccount();
  const { disconnect } = useDisconnect();
  const { connect, connectors } = useConnect();
  const queryClient = useQueryClient();
  
  const [isConnecting, setIsConnecting] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);

  // Restore wallet connection on app load
  useEffect(() => {
    const restoreConnection = async () => {
      console.log('WalletContext: Restoring wallet connection...');
      
      // Check if there's a previously connected wallet
      const storedConnectorId = localStorage.getItem('wallet-connector-id');
      
      if (storedConnectorId && !isConnected) {
        setIsReconnecting(true);
        console.log('WalletContext: Found stored connector, attempting to reconnect...');
        
        try {
          const connector = connectors.find(c => c.id === storedConnectorId);
          if (connector) {
            await connect({ connector });
            console.log('WalletContext: Successfully reconnected to wallet');
          } else {
            console.log('WalletContext: Stored connector not found, clearing storage');
            localStorage.removeItem('wallet-connector-id');
          }
        } catch (error) {
          console.error('WalletContext: Failed to reconnect wallet', error);
          localStorage.removeItem('wallet-connector-id');
        } finally {
          setIsReconnecting(false);
        }
      }
    };

    restoreConnection();
  }, [isConnected, connect, connectors]);

  // Save connector ID when connection changes
  useEffect(() => {
    if (isConnected && connector) {
      console.log('WalletContext: Saving connector ID', connector.id);
      localStorage.setItem('wallet-connector-id', connector.id);
    } else if (!isConnected) {
      console.log('WalletContext: Clearing connector ID');
      localStorage.removeItem('wallet-connector-id');
    }
  }, [isConnected, connector]);

  // Clear query cache when wallet disconnects
  useEffect(() => {
    if (!isConnected && address) {
      console.log('WalletContext: Wallet disconnected, clearing query cache');
      queryClient.clear();
    }
  }, [isConnected, address, queryClient]);

  const handleDisconnect = () => {
    console.log('WalletContext: Manual disconnect requested');
    disconnect();
    localStorage.removeItem('wallet-connector-id');
  };

  const handleReconnect = async () => {
    console.log('WalletContext: Manual reconnect requested');
    setIsReconnecting(true);
    
    try {
      const storedConnectorId = localStorage.getItem('wallet-connector-id');
      if (storedConnectorId) {
        const connector = connectors.find(c => c.id === storedConnectorId);
        if (connector) {
          await connect({ connector });
        }
      }
    } catch (error) {
      console.error('WalletContext: Manual reconnect failed', error);
    } finally {
      setIsReconnecting(false);
    }
  };

  const value: WalletContextType = {
    isConnected,
    address,
    isConnecting,
    isReconnecting,
    disconnect: handleDisconnect,
    reconnect: handleReconnect,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWalletContext() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWalletContext must be used within a WalletProvider');
  }
  return context;
}
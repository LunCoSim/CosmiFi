# Frontend Contract Integration Guide

## Overview

This guide provides detailed instructions for integrating the BlueprintFactory and DesignerRegistry smart contracts with the CosmiFi frontend application. The implementation uses modern Web3 technologies including Viem, Wagmi, RainbowKit, React Hook Form, Redux with Redux Persist, and Tailwind CSS for a responsive design.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Setup](#project-setup)
3. [Smart Contract Integration](#smart-contract-integration)
4. [Wallet Connection with RainbowKit](#wallet-connection-with-rainbowkit)
5. [Contract Interactions with Wagmi & Viem](#contract-interactions-with-wagmi--viem)
6. [State Management with Redux](#state-management-with-redux)
7. [Form Handling with React Hook Form](#form-handling-with-react-hook-form)
8. [Responsive Design with Tailwind CSS](#responsive-design-with-tailwind-css)
9. [User Flow Implementation](#user-flow-implementation)
10. [Error Handling & User Experience](#error-handling--user-experience)
11. [Testing Strategy](#testing-strategy)

---

## Prerequisites

Before starting, ensure you have:

- Node.js 18+ installed
- Basic understanding of React, TypeScript, and Ethereum smart contracts
- Contract ABIs and addresses for DesignerRegistry and BlueprintNFTFactory
- Access to an Ethereum RPC endpoint (Base Sepolia for testing)

---

## Project Setup

### 1. Install Required Dependencies

```bash
# Core Web3 dependencies
npm install wagmi viem @rainbow-me/rainbowkit

# State management
npm install @reduxjs/toolkit react-redux redux-persist

# Form handling
npm install react-hook-form @hookform/resolvers zod

# UI and styling
npm install tailwindcss postcss autoprefixer
npm install @headlessui/react @heroicons/react

# Additional utilities
npm install axios clsx
```

### 2. Configure Tailwind CSS

```bash
npx tailwindcss init -p
```

Update `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
      },
    },
  },
  plugins: [],
}
```

### 3. Project Structure

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Modal.tsx
│   │   └── index.ts
│   ├── wallet/
│   │   ├── WalletButton.tsx
│   │   └── WalletInfo.tsx
│   ├── designer/
│   │   ├── RegistrationForm.tsx
│   │   ├── CollectionCard.tsx
│   │   └── CreateCollectionModal.tsx
│   └── nft/
│       ├── MintForm.tsx
│       ├── NFTCard.tsx
│       └── NFTGallery.tsx
├── contracts/
│   ├── addresses.ts
│   ├── abi/
│   │   ├── DesignerRegistry.json
│   │   └── BlueprintNFTFactory.json
│   └── index.ts
├── hooks/
│   ├── useContract.ts
│   ├── useDesigner.ts
│   └── useCollection.ts
├── store/
│   ├── index.ts
│   ├── slices/
│   │   ├── designerSlice.ts
│   │   ├── collectionSlice.ts
│   │   └── uiSlice.ts
│   └── middleware/
│       └── persistMiddleware.ts
├── types/
│   ├── designer.ts
│   ├── collection.ts
│   └── nft.ts
└── utils/
    ├── constants.ts
    ├── formatters.ts
    └── validations.ts
```

---

## Smart Contract Integration

### 1. Contract Configuration

Create `src/contracts/addresses.ts`:

```typescript
export const CONTRACT_ADDRESSES = {
  [1]: { // Ethereum Mainnet
    DESIGNER_REGISTRY: '0x...',
    BLUEPRINT_FACTORY: '0x...',
  },
  [8453]: { // Base Mainnet
    DESIGNER_REGISTRY: '0x...',
    BLUEPRINT_FACTORY: '0x...',
  },
  [84532]: { // Base Sepolia Testnet
    DESIGNER_REGISTRY: '0x6C4aab39dd9063A7E79FD26caE373bae9efdccb8',
    BLUEPRINT_FACTORY: '0x1700cB6b777b330b870d4Eb9E64025A3bB4F38aE',
  },
} as const;

export const DEFAULT_CHAIN_ID = 84532; // Base Sepolia for development
```

Create `src/contracts/index.ts`:

```typescript
import { DESIGNER_REGISTRY, BLUEPRINT_FACTORY } from './addresses';
import DesignerRegistryABI from './abi/DesignerRegistry.json';
import BlueprintFactoryABI from './abi/BlueprintNFTFactory.json';

export const CONTRACTS = {
  DESIGNER_REGISTRY: {
    address: DESIGNER_REGISTRY,
    abi: DesignerRegistryABI.abi,
  },
  BLUEPRINT_FACTORY: {
    address: BLUEPRINT_FACTORY,
    abi: BlueprintFactoryABI.abi,
  },
} as const;
```

### 2. Wagmi Configuration

Create `src/app/providers.tsx`:

```typescript
'use client';

import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from '../wagmi';
import { ReactNode } from 'react';

const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

Create `src/wagmi.ts`:

```typescript
import { createConfig, http } from 'wagmi';
import { base, baseSepolia, mainnet } from 'wagmi/chains';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

export const config = getDefaultConfig({
  appName: 'CosmiFi',
  projectId: 'YOUR_PROJECT_ID', // Get from WalletConnect
  chains: [mainnet, base, baseSepolia],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
});
```

---

## Wallet Connection with RainbowKit

### 1. Wallet Button Component

Create `src/components/wallet/WalletButton.tsx`:

```typescript
'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

export function WalletButton() {
  const { isConnected } = useAccount();

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus ||
            authenticationStatus === 'authenticated');

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              'style': {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    type="button"
                    className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Connect Wallet
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Wrong network
                  </button>
                );
              }

              return (
                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    onClick={openChainModal}
                    style={{ display: 'flex', alignItems: 'center' }}
                    type="button"
                    className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    {chain.hasIcon && (
                      <div
                        style={{
                          background: chain.iconBackground,
                          width: 12,
                          height: 12,
                          borderRadius: 999,
                          overflow: 'hidden',
                        }}
                      >
                        {chain.iconUrl && (
                          <img
                            alt={chain.name ?? 'Chain icon'}
                            src={chain.iconUrl}
                            style={{ width: 12, height: 12 }}
                          />
                        )}
                      </div>
                    )}
                    {chain.name}
                  </button>

                  <button
                    onClick={openAccountModal}
                    type="button"
                    className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    {account.displayName}
                    {account.displayBalance
                      ? ` (${account.displayBalance})`
                      : ''}
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
```

### 2. Wallet Info Component

Create `src/components/wallet/WalletInfo.tsx`:

```typescript
'use client';

import { useAccount, useBalance, useDisconnect } from 'wagmi';
import { formatEther } from 'viem';
import { Button } from '../ui/Button';

export function WalletInfo() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const { disconnect } = useDisconnect();

  if (!isConnected || !address) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">Wallet Info</h3>
        <Button variant="outline" size="sm" onClick={() => disconnect()}>
          Disconnect
        </Button>
      </div>
      
      <div className="space-y-2">
        <div>
          <span className="text-gray-500 text-sm">Address:</span>
          <p className="font-mono text-sm break-all">{address}</p>
        </div>
        
        {balance && (
          <div>
            <span className="text-gray-500 text-sm">Balance:</span>
            <p className="font-semibold">
              {parseFloat(formatEther(balance.value)).toFixed(4)} {balance.symbol}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## Contract Interactions with Wagmi & Viem

### 1. Custom Hooks for Contract Interactions

Create `src/hooks/useContract.ts`:

```typescript
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACTS } from '../contracts';
import { Address } from 'viem';

export function useIsDesigner(address?: Address) {
  return useReadContract({
    ...CONTRACTS.DESIGNER_REGISTRY,
    functionName: 'isDesigner',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });
}

export function useRegisterDesigner() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const register = () => {
    writeContract({
      ...CONTRACTS.DESIGNER_REGISTRY,
      functionName: 'registerDesigner',
    });
  };

  return {
    register,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    hash,
  };
}

export function useCreateCollection() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const createCollection = (name: string, symbol: string) => {
    writeContract({
      ...CONTRACTS.BLUEPRINT_FACTORY,
      functionName: 'createCollection',
      args: [name, symbol],
    });
  };

  return {
    createCollection,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    hash,
  };
}

export function useGetCollections(designer?: Address) {
  return useReadContract({
    ...CONTRACTS.BLUEPRINT_FACTORY,
    functionName: 'getCollections',
    args: designer ? [designer] : undefined,
    query: {
      enabled: !!designer,
    },
  });
}

export function useGetCollectionCount(designer?: Address) {
  return useReadContract({
    ...CONTRACTS.BLUEPRINT_FACTORY,
    functionName: 'getCollectionCount',
    args: designer ? [designer] : undefined,
    query: {
      enabled: !!designer,
    },
  });
}

export function useGetDesigner(collection?: Address) {
  return useReadContract({
    ...CONTRACTS.BLUEPRINT_FACTORY,
    functionName: 'getDesigner',
    args: collection ? [collection] : undefined,
    query: {
      enabled: !!collection,
    },
  });
}
```

### 2. Designer-Specific Hooks

Create `src/hooks/useDesigner.ts`:

```typescript
import { useAccount } from 'wagmi';
import { useIsDesigner, useRegisterDesigner } from './useContract';
import { useEffect, useState } from 'react';

export function useDesigner() {
  const { address } = useAccount();
  const { data: isDesigner, isLoading: isCheckingDesigner } = useIsDesigner(address);
  const { register, isPending: isRegistering, isConfirmed } = useRegisterDesigner();
  
  const [isRegisteringModalOpen, setIsRegisteringModalOpen] = useState(false);

  useEffect(() => {
    if (isConfirmed) {
      setIsRegisteringModalOpen(false);
    }
  }, [isConfirmed]);

  return {
    address,
    isDesigner,
    isCheckingDesigner,
    isRegistering,
    register,
    isRegisteringModalOpen,
    setIsRegisteringModalOpen,
  };
}
```

### 3. Collection-Specific Hooks

Create `src/hooks/useCollection.ts`:

```typescript
import { useAccount } from 'wagmi';
import { useGetCollections, useGetCollectionCount, useCreateCollection } from './useContract';
import { useState } from 'react';

export function useCollection() {
  const { address } = useAccount();
  const { data: collections, isLoading: isLoadingCollections } = useGetCollections(address);
  const { data: collectionCount } = useGetCollectionCount(address);
  const { createCollection, isPending: isCreating, isConfirmed } = useCreateCollection();
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleCreateCollection = async (name: string, symbol: string) => {
    try {
      await createCollection(name, symbol);
      // Close modal on success
      if (isConfirmed) {
        setIsCreateModalOpen(false);
      }
    } catch (error) {
      console.error('Failed to create collection:', error);
    }
  };

  return {
    collections,
    collectionCount,
    isLoadingCollections,
    isCreating,
    isConfirmed,
    isCreateModalOpen,
    setIsCreateModalOpen,
    createCollection: handleCreateCollection,
  };
}
```

---

## State Management with Redux

### 1. Redux Store Configuration

Create `src/store/index.ts`:

```typescript
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import designerSlice from './slices/designerSlice';
import collectionSlice from './slices/collectionSlice';
import uiSlice from './slices/uiSlice';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['designer', 'ui'], // Only persist these slices
};

const persistedDesignerReducer = persistReducer(persistConfig, designerSlice);
const persistedUIReducer = persistReducer(persistConfig, uiSlice);

export const store = configureStore({
  reducer: {
    designer: persistedDesignerReducer,
    collection: collectionSlice,
    ui: persistedUIReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### 2. Designer Slice

Create `src/store/slices/designerSlice.ts`:

```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DesignerState {
  isRegistered: boolean;
  profile: {
    name?: string;
    bio?: string;
    avatarUrl?: string;
  } | null;
  collections: string[];
  isLoading: boolean;
  error: string | null;
}

const initialState: DesignerState = {
  isRegistered: false,
  profile: null,
  collections: [],
  isLoading: false,
  error: null,
};

const designerSlice = createSlice({
  name: 'designer',
  initialState,
  reducers: {
    setDesignerStatus: (state, action: PayloadAction<boolean>) => {
      state.isRegistered = action.payload;
    },
    setDesignerProfile: (state, action: PayloadAction<DesignerState['profile']>) => {
      state.profile = action.payload;
    },
    setCollections: (state, action: PayloadAction<string[]>) => {
      state.collections = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setDesignerStatus,
  setDesignerProfile,
  setCollections,
  setLoading,
  setError,
  clearError,
} = designerSlice.actions;

export default designerSlice.reducer;
```

### 3. Collection Slice

Create `src/store/slices/collectionSlice.ts`:

```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Collection {
  address: string;
  name: string;
  symbol: string;
  designer: string;
  totalSupply: number;
}

interface CollectionState {
  collections: Collection[];
  selectedCollection: Collection | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: CollectionState = {
  collections: [],
  selectedCollection: null,
  isLoading: false,
  error: null,
};

const collectionSlice = createSlice({
  name: 'collection',
  initialState,
  reducers: {
    setCollections: (state, action: PayloadAction<Collection[]>) => {
      state.collections = action.payload;
    },
    addCollection: (state, action: PayloadAction<Collection>) => {
      state.collections.push(action.payload);
    },
    setSelectedCollection: (state, action: PayloadAction<Collection | null>) => {
      state.selectedCollection = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setCollections,
  addCollection,
  setSelectedCollection,
  setLoading,
  setError,
  clearError,
} = collectionSlice.actions;

export default collectionSlice.reducer;
```

### 4. UI Slice

Create `src/store/slices/uiSlice.ts`:

```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  isRegisterModalOpen: boolean;
  isCreateCollectionModalOpen: boolean;
  isMintModalOpen: boolean;
  theme: 'light' | 'dark';
  notifications: Notification[];
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: number;
}

const initialState: UIState = {
  isRegisterModalOpen: false,
  isCreateCollectionModalOpen: false,
  isMintModalOpen: false,
  theme: 'light',
  notifications: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setRegisterModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isRegisterModalOpen = action.payload;
    },
    setCreateCollectionModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isCreateCollectionModalOpen = action.payload;
    },
    setMintModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isMintModalOpen = action.payload;
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp'>>) => {
      const notification: Notification = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: Date.now(),
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
    },
  },
});

export const {
  setRegisterModalOpen,
  setCreateCollectionModalOpen,
  setMintModalOpen,
  setTheme,
  addNotification,
  removeNotification,
} = uiSlice.actions;

export default uiSlice.reducer;
```

---

## Form Handling with React Hook Form

### 1. Validation Schema

Create `src/utils/validations.ts`:

```typescript
import { z } from 'zod';

export const designerRegistrationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
  bio: z.string().min(10, 'Bio must be at least 10 characters').max(500, 'Bio must be less than 500 characters'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  twitter: z.string().min(2, 'Twitter handle must be at least 2 characters').optional().or(z.literal('')),
});

export const createCollectionSchema = z.object({
  name: z.string().min(2, 'Collection name must be at least 2 characters').max(100, 'Collection name must be less than 100 characters'),
  symbol: z.string().min(2, 'Symbol must be at least 2 characters').max(10, 'Symbol must be less than 10 characters').regex(/^[A-Z]+$/, 'Symbol must be uppercase letters only'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description must be less than 1000 characters'),
});

export const mintNFTSchema = z.object({
  name: z.string().min(2, 'NFT name must be at least 2 characters').max(100, 'NFT name must be less than 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description must be less than 1000 characters'),
  category: z.string().min(1, 'Please select a category'),
  tags: z.array(z.string()).min(1, 'Please add at least one tag'),
  license: z.string().min(1, 'Please select a license'),
});

export type DesignerRegistrationForm = z.infer<typeof designerRegistrationSchema>;
export type CreateCollectionForm = z.infer<typeof createCollectionSchema>;
export type MintNFTForm = z.infer<typeof mintNFTSchema>;
```

### 2. Designer Registration Form Component

Create `src/components/designer/RegistrationForm.tsx`:

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { designerRegistrationSchema, DesignerRegistrationForm } from '../../utils/validations';
import { useDesigner } from '../../hooks/useDesigner';
import { Button } from '../ui/Button';
import { useDispatch } from 'react-redux';
import { setRegisterModalOpen, addNotification } from '../../store/slices/uiSlice';

export function RegistrationForm() {
  const { register, isRegistering } = useDesigner();
  const dispatch = useDispatch();

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<DesignerRegistrationForm>({
    resolver: zodResolver(designerRegistrationSchema),
  });

  const onSubmit = async (data: DesignerRegistrationForm) => {
    try {
      await register();
      
      dispatch(
        addNotification({
          type: 'success',
          title: 'Registration Successful',
          message: 'You are now registered as a designer!',
        })
      );
      
      dispatch(setRegisterModalOpen(false));
      reset();
    } catch (error) {
      dispatch(
        addNotification({
          type: 'error',
          title: 'Registration Failed',
          message: 'Failed to register as a designer. Please try again.',
        })
      );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Register as Designer</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Name *
          </label>
          <input
            id="name"
            type="text"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            {...formRegister('name')}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
            Bio *
          </label>
          <textarea
            id="bio"
            rows={4}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors.bio ? 'border-red-500' : 'border-gray-300'
            }`}
            {...formRegister('bio')}
          />
          {errors.bio && (
            <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            {...formRegister('email')}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
            Website
          </label>
          <input
            id="website"
            type="url"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors.website ? 'border-red-500' : 'border-gray-300'
            }`}
            {...formRegister('website')}
          />
          {errors.website && (
            <p className="mt-1 text-sm text-red-600">{errors.website.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="twitter" className="block text-sm font-medium text-gray-700 mb-1">
            Twitter
          </label>
          <input
            id="twitter"
            type="text"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors.twitter ? 'border-red-500' : 'border-gray-300'
            }`}
            {...formRegister('twitter')}
          />
          {errors.twitter && (
            <p className="mt-1 text-sm text-red-600">{errors.twitter.message}</p>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => dispatch(setRegisterModalOpen(false))}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || isRegistering}
            className="flex-1"
          >
            {isSubmitting || isRegistering ? 'Registering...' : 'Register'}
          </Button>
        </div>
      </form>
    </div>
  );
}
```

### 3. Create Collection Form Component

Create `src/components/designer/CreateCollectionModal.tsx`:

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createCollectionSchema, CreateCollectionForm } from '../../utils/validations';
import { useCollection } from '../../hooks/useCollection';
import { Button } from '../ui/Button';
import { useDispatch } from 'react-redux';
import { setCreateCollectionModalOpen, addNotification } from '../../store/slices/uiSlice';
import { Modal } from '../ui/Modal';

export function CreateCollectionModal() {
  const { createCollection, isCreating } = useCollection();
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateCollectionForm>({
    resolver: zodResolver(createCollectionSchema),
  });

  const onSubmit = async (data: CreateCollectionForm) => {
    try {
      await createCollection(data.name, data.symbol);
      
      dispatch(
        addNotification({
          type: 'success',
          title: 'Collection Created',
          message: `Your collection "${data.name}" has been created successfully!`,
        })
      );
      
      dispatch(setCreateCollectionModalOpen(false));
      reset();
    } catch (error) {
      dispatch(
        addNotification({
          type: 'error',
          title: 'Creation Failed',
          message: 'Failed to create collection. Please try again.',
        })
      );
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={() => dispatch(setCreateCollectionModalOpen(false))}
      title="Create New Collection"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Collection Name *
          </label>
          <input
            id="name"
            type="text"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            {...register('name')}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="symbol" className="block text-sm font-medium text-gray-700 mb-1">
            Symbol *
          </label>
          <input
            id="symbol"
            type="text"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 uppercase ${
              errors.symbol ? 'border-red-500' : 'border-gray-300'
            }`}
            {...register('symbol')}
          />
          {errors.symbol && (
            <p className="mt-1 text-sm text-red-600">{errors.symbol.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Short identifier (2-10 uppercase letters)
          </p>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            id="description"
            rows={4}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
            {...register('description')}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => dispatch(setCreateCollectionModalOpen(false))}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || isCreating}
            className="flex-1"
          >
            {isSubmitting || isCreating ? 'Creating...' : 'Create Collection'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
```

---

## Responsive Design with Tailwind CSS

### 1. UI Components

Create `src/components/ui/Button.tsx`:

```typescript
import { ButtonHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
    
    const variantClasses = {
      primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
      outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-primary-500',
      ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-primary-500',
    };
    
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    return (
      <button
        className={clsx(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
```

Create `src/components/ui/Modal.tsx`:

```typescript
import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className={clsx(
                  'w-full transform rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all',
                  sizeClasses[size]
                )}
              >
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    {title}
                  </Dialog.Title>
                  <button
                    type="button"
                    className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div>{children}</div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
```

### 2. Collection Card Component

Create `src/components/designer/CollectionCard.tsx`:

```typescript
import { Address } from 'viem';
import { formatAddress } from '../../utils/formatters';
import { Button } from '../ui/Button';

interface CollectionCardProps {
  address: Address;
  name: string;
  symbol: string;
  designer: Address;
  totalSupply: number;
  onView?: () => void;
  onMint?: () => void;
  isOwner?: boolean;
}

export function CollectionCard({
  address,
  name,
  symbol,
  designer,
  totalSupply,
  onView,
  onMint,
  isOwner = false,
}: CollectionCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{name}</h3>
            <p className="text-sm text-gray-500">{symbol}</p>
          </div>
          <div className="bg-primary-100 text-primary-800 text-xs font-medium px-2.5 py-0.5 rounded">
            {totalSupply} items
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Designer: <span className="font-medium">{formatAddress(designer)}</span>
          </p>
          <p className="text-sm text-gray-600">
            Contract: <span className="font-medium font-mono text-xs">{formatAddress(address)}</span>
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onView}
            className="flex-1"
          >
            View Collection
          </Button>
          
          {isOwner && (
            <Button
              size="sm"
              onClick={onMint}
              className="flex-1"
            >
              Mint NFT
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
```

### 3. Responsive Grid Layout

Create `src/components/designer/CollectionGrid.tsx`:

```typescript
import { CollectionCard } from './CollectionCard';
import { Address } from 'viem';

interface Collection {
  address: Address;
  name: string;
  symbol: string;
  designer: Address;
  totalSupply: number;
}

interface CollectionGridProps {
  collections: Collection[];
  currentDesignerAddress?: Address;
  onViewCollection: (collection: Collection) => void;
  onMintNFT: (collection: Collection) => void;
  isLoading?: boolean;
}

export function CollectionGrid({
  collections,
  currentDesignerAddress,
  onViewCollection,
  onMintNFT,
  isLoading = false,
}: CollectionGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
            <div className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-4"></div>
              <div className="flex gap-2">
                <div className="h-8 bg-gray-200 rounded flex-1"></div>
                <div className="h-8 bg-gray-200 rounded flex-1"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (collections.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-4">No collections found</div>
        <p className="text-gray-400">
          Create your first collection to start minting NFTs
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {collections.map((collection) => (
        <CollectionCard
          key={collection.address}
          address={collection.address}
          name={collection.name}
          symbol={collection.symbol}
          designer={collection.designer}
          totalSupply={collection.totalSupply}
          isOwner={currentDesignerAddress === collection.designer}
          onView={() => onViewCollection(collection)}
          onMint={() => onMintNFT(collection)}
        />
      ))}
    </div>
  );
}
```

---

## User Flow Implementation

### 1. Designer Dashboard Page

Create `src/app/designer/page.tsx`:

```typescript
'use client';

import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useDesigner } from '../../hooks/useDesigner';
import { useCollection } from '../../hooks/useCollection';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { setRegisterModalOpen, setCreateCollectionModalOpen } from '../../store/slices/uiSlice';
import { WalletButton } from '../../components/wallet/WalletButton';
import { CollectionGrid } from '../../components/designer/CollectionGrid';
import { Button } from '../../components/ui/Button';
import { RegistrationForm } from '../../components/designer/RegistrationForm';
import { CreateCollectionModal } from '../../components/designer/CreateCollectionModal';
import { Modal } from '../../components/ui/Modal';

export default function DesignerDashboard() {
  const { address, isConnected } = useAccount();
  const { isDesigner, isCheckingDesigner, isRegisteringModalOpen } = useDesigner();
  const { collections, isLoadingCollections, isCreateModalOpen } = useCollection();
  const dispatch = useDispatch();
  const { isRegisterModalOpen } = useSelector((state: RootState) => state.ui);

  useEffect(() => {
    // Redirect to home if not connected
    if (!isConnected) {
      window.location.href = '/';
    }
  }, [isConnected]);

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h1>
          <p className="text-gray-600 mb-6">Please connect your wallet to access the designer dashboard</p>
          <WalletButton />
        </div>
      </div>
    );
  }

  if (isCheckingDesigner) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking designer status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">Designer Dashboard</h1>
            <WalletButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isDesigner ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Become a Designer</h2>
            <p className="text-gray-600 mb-6">
              Register as a designer to create collections and mint NFTs
            </p>
            <Button onClick={() => dispatch(setRegisterModalOpen(true))}>
              Register as Designer
            </Button>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Your Collections</h2>
                <p className="text-gray-600">
                  Manage your NFT collections and create new ones
                </p>
              </div>
              <Button onClick={() => dispatch(setCreateCollectionModalOpen(true))}>
                Create Collection
              </Button>
            </div>

            <CollectionGrid
              collections={collections}
              currentDesignerAddress={address}
              onViewCollection={(collection) => {
                // Navigate to collection detail page
                window.location.href = `/collection/${collection.address}`;
              }}
              onMintNFT={(collection) => {
                // Navigate to mint page
                window.location.href = `/collection/${collection.address}/mint`;
              }}
              isLoading={isLoadingCollections}
            />
          </div>
        )}
      </main>

      {/* Modals */}
      {isRegisterModalOpen && (
        <Modal
          isOpen={isRegisterModalOpen}
          onClose={() => dispatch(setRegisterModalOpen(false))}
          title="Register as Designer"
        >
          <RegistrationForm />
        </Modal>
      )}

      {isCreateModalOpen && <CreateCollectionModal />}
    </div>
  );
}
```

### 2. Collection Detail Page

Create `src/app/collection/[address]/page.tsx`:

```typescript
'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useReadContract } from 'wagmi';
import { formatEther } from 'viem';
import { CONTRACTS } from '../../../contracts';
import { Address } from 'viem';
import { Button } from '../../../components/ui/Button';
import { NFTGrid } from '../../../components/nft/NFTGrid';

interface Collection {
  name: string;
  symbol: string;
  designer: Address;
  totalSupply: number;
}

export default function CollectionDetail() {
  const params = useParams();
  const collectionAddress = params.address as Address;
  const { address } = useAccount();
  
  const [collection, setCollection] = useState<Collection | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Read collection details from contract
  const { data: name } = useReadContract({
    ...CONTRACTS.BLUEPRINT_FACTORY,
    address: collectionAddress,
    functionName: 'name',
  });

  const { data: symbol } = useReadContract({
    ...CONTRACTS.BLUEPRINT_FACTORY,
    address: collectionAddress,
    functionName: 'symbol',
  });

  const { data: designer } = useReadContract({
    ...CONTRACTS.BLUEPRINT_FACTORY,
    address: collectionAddress,
    functionName: 'designer',
  });

  const { data: totalSupply } = useReadContract({
    ...CONTRACTS.BLUEPRINT_FACTORY,
    address: collectionAddress,
    functionName: 'totalSupply',
  });

  useEffect(() => {
    if (name && symbol && designer && totalSupply !== undefined) {
      setCollection({
        name: name as string,
        symbol: symbol as string,
        designer: designer as Address,
        totalSupply: Number(totalSupply),
      });
      setIsLoading(false);
    }
  }, [name, symbol, designer, totalSupply]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Collection Not Found</h1>
          <p className="text-gray-600">The collection you're looking for doesn't exist</p>
        </div>
      </div>
    );
  }

  const isOwner = address === collection.designer;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <nav className="flex mb-4" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-4">
                <li>
                  <a href="/designer" className="text-gray-500 hover:text-gray-700">
                    Dashboard
                  </a>
                </li>
                <li>
                  <div className="flex items-center">
                    <svg
                      className="flex-shrink-0 h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <a
                      href={`/collection/${collectionAddress}`}
                      className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700"
                    >
                      {collection.name}
                    </a>
                  </div>
                </li>
              </ol>
            </nav>
            
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{collection.name}</h1>
                <p className="text-gray-600">{collection.symbol}</p>
              </div>
              
              {isOwner && (
                <div className="mt-4 md:mt-0">
                  <Button href={`/collection/${collectionAddress}/mint`}>
                    Mint New NFT
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Collection Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-500">Designer</p>
              <p className="font-medium">{collection.designer}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Total Items</p>
              <p className="font-medium">{collection.totalSupply}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Contract Address</p>
              <p className="font-medium font-mono text-sm">{collectionAddress}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Symbol</p>
              <p className="font-medium">{collection.symbol}</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Items in this Collection</h2>
          <NFTGrid collectionAddress={collectionAddress} />
        </div>
      </main>
    </div>
  );
}
```

---

## Error Handling & User Experience

### 1. Error Boundary Component

Create `src/components/ErrorBoundary.tsx`:

```typescript
'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './ui/Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-6">
              We encountered an unexpected error. Please try refreshing the page.
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="mb-4"
            >
              Refresh Page
            </Button>
            {process.env.NODE_ENV === 'development' && (
              <details className="text-left text-sm text-gray-500">
                <summary>Error details</summary>
                <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto">
                  {this.state.error?.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 2. Transaction Status Component

Create `src/components/TransactionStatus.tsx`:

```typescript
import { useEffect, useState } from 'react';
import { useWaitForTransactionReceipt } from 'wagmi';
import { CheckCircleIcon, ExclamationCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { Button } from './ui/Button';

interface TransactionStatusProps {
  hash?: `0x${string}`;
  onSuccess?: () => void;
  onError?: () => void;
}

export function TransactionStatus({ hash, onSuccess, onError }: TransactionStatusProps) {
  const [showDetails, setShowDetails] = useState(false);
  
  const { data, isLoading, isSuccess, isError, error } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (isSuccess && onSuccess) {
      onSuccess();
    }
    if (isError && onError) {
      onError();
    }
  }, [isSuccess, isError, onSuccess, onError]);

  if (!hash) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {isLoading && (
            <ClockIcon className="h-5 w-5 text-yellow-500 mr-2 animate-spin" />
          )}
          {isSuccess && (
            <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
          )}
          {isError && (
            <ExclamationCircleIcon className="h-5 w-5 text-red-500 mr-2" />
          )}
          
          <div>
            <p className="font-medium">
              {isLoading && 'Transaction Pending...'}
              {isSuccess && 'Transaction Successful'}
              {isError && 'Transaction Failed'}
            </p>
            <p className="text-sm text-gray-500">
              {hash && `${hash.slice(0, 6)}...${hash.slice(-4)}`}
            </p>
          </div>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? 'Hide' : 'Details'}
        </Button>
      </div>
      
      {showDetails && (
        <div className="mt-4 pt-4 border-t">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Transaction Hash:</span>
              <p className="font-mono break-all">{hash}</p>
            </div>
            
            {data && (
              <>
                <div>
                  <span className="text-gray-500">Block Number:</span>
                  <p className="font-medium">{data.blockNumber.toString()}</p>
                </div>
                <div>
                  <span className="text-gray-500">Gas Used:</span>
                  <p className="font-medium">{data.gasUsed.toString()}</p>
                </div>
              </>
            )}
            
            {error && (
              <div className="md:col-span-2">
                <span className="text-gray-500">Error:</span>
                <p className="text-red-600">{error.message}</p>
              </div>
            )}
          </div>
          
          {hash && (
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`https://sepolia.basescan.org/tx/${hash}`, '_blank')}
              >
                View on BaseScan
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

---

## Testing Strategy

### 1. Contract Interaction Testing

Create `src/__tests__/hooks/useContract.test.ts`:

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useIsDesigner, useRegisterDesigner } from '../../hooks/useContract';
import { WagmiProvider } from 'wagmi';
import { config } from '../../wagmi';

// Mock wagmi
jest.mock('wagmi', () => ({
  ...jest.requireActual('wagmi'),
  useReadContract: jest.fn(),
  useWriteContract: jest.fn(),
  useWaitForTransactionReceipt: jest.fn(),
}));

describe('useContract', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <WagmiProvider config={config}>{children}</WagmiProvider>
  );

  describe('useIsDesigner', () => {
    it('should return designer status', async () => {
      const mockUseReadContract = require('wagmi').useReadContract;
      mockUseReadContract.mockReturnValue({
        data: true,
        isLoading: false,
        error: null,
      });

      const { result } = renderHook(() => useIsDesigner('0x123'), { wrapper });

      await waitFor(() => {
        expect(result.current.data).toBe(true);
      });
    });
  });

  describe('useRegisterDesigner', () => {
    it('should register designer', async () => {
      const mockUseWriteContract = require('wagmi').useWriteContract;
      const mockUseWaitForTransactionReceipt = require('wagmi').useWaitForTransactionReceipt;
      
      const mockWrite = jest.fn();
      mockUseWriteContract.mockReturnValue({
        writeContract: mockWrite,
        data: '0xhash',
        isPending: false,
        error: null,
      });
      
      mockUseWaitForTransactionReceipt.mockReturnValue({
        isLoading: false,
        isSuccess: true,
        error: null,
      });

      const { result } = renderHook(() => useRegisterDesigner(), { wrapper });

      result.current.register();
      
      expect(mockWrite).toHaveBeenCalledWith({
        address: expect.any(String),
        abi: expect.any(Array),
        functionName: 'registerDesigner',
      });
    });
  });
});
```

### 2. Component Testing

Create `src/__tests__/components/CollectionCard.test.tsx`:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { CollectionCard } from '../../components/designer/CollectionCard';
import { Address } from 'viem';

const mockCollection = {
  address: '0x1234567890123456789012345678901234567890' as Address,
  name: 'Test Collection',
  symbol: 'TEST',
  designer: '0x0987654321098765432109876543210987654321' as Address,
  totalSupply: 5,
};

describe('CollectionCard', () => {
  it('should render collection information', () => {
    render(<CollectionCard {...mockCollection} />);
    
    expect(screen.getByText('Test Collection')).toBeInTheDocument();
    expect(screen.getByText('TEST')).toBeInTheDocument();
    expect(screen.getByText('5 items')).toBeInTheDocument();
  });

  it('should call onView when View Collection is clicked', () => {
    const mockOnView = jest.fn();
    render(<CollectionCard {...mockCollection} onView={mockOnView} />);
    
    fireEvent.click(screen.getByText('View Collection'));
    expect(mockOnView).toHaveBeenCalledTimes(1);
  });

  it('should show Mint NFT button when user is owner', () => {
    render(<CollectionCard {...mockCollection} isOwner={true} />);
    
    expect(screen.getByText('Mint NFT')).toBeInTheDocument();
  });

  it('should not show Mint NFT button when user is not owner', () => {
    render(<CollectionCard {...mockCollection} isOwner={false} />);
    
    expect(screen.queryByText('Mint NFT')).not.toBeInTheDocument();
  });
});
```

---

## Deployment Considerations

### 1. Environment Variables

Create `.env.local`:

```bash
# WalletConnect Project ID
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id

# Contract Addresses
NEXT_PUBLIC_DESIGNER_REGISTRY_ADDRESS=0x6C4aab39dd9063A7E79FD26caE373bae9efdccb8
NEXT_PUBLIC_BLUEPRINT_FACTORY_ADDRESS=0x1700cB6b777b330b870d4Eb9E64025A3bB4F38aE

# RPC URLs
NEXT_PUBLIC_RPC_URL=https://sepolia.base.org

# IPFS (if needed for frontend uploads)
NEXT_PUBLIC_PINATA_API_KEY=your_pinata_api_key
NEXT_PUBLIC_PINATA_SECRET_KEY=your_pinata_secret_key
```

### 2. Build Configuration

Update `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
};

module.exports = nextConfig;
```

---

## Conclusion

This guide provides a comprehensive implementation for integrating the BlueprintFactory and DesignerRegistry contracts with a modern React frontend. The implementation follows best practices for:

1. **Web3 Integration**: Using Wagmi and Viem for efficient blockchain interactions
2. **State Management**: Redux with Redux Persist for reliable state handling
3. **Form Handling**: React Hook Form with Zod for robust form validation
4. **Responsive Design**: Tailwind CSS for mobile-first responsive layouts
5. **User Experience**: Proper loading states, error handling, and transaction feedback
6. **Testing**: Unit tests for hooks and components

The implementation allows users to:
- Connect their wallet using RainbowKit
- Register as a designer on the DesignerRegistry contract
- Create NFT collections through the BlueprintFactory contract
- View and manage their collections
- Mint new NFTs in their collections

This architecture provides a solid foundation for the CosmiFi platform's frontend implementation.
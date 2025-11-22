'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { formatEther } from 'viem';
import { CONTRACTS } from '../../../src/contracts';
import { Address } from 'viem';
import { Button } from '../../../src/components/ui/Button';
import { NFTGrid } from '../../../src/components/nft/NFTGrid';
import { PageLoading } from '../../../src/components/ui/Loading';
import { useCollectionEvents } from '../../../src/hooks/useContractEvents';
import { useQueryClient } from '@tanstack/react-query';

// Define type for NFT minted event data
interface NFTMintedData {
  from: string;
  to: string;
  tokenId: bigint;
}

interface Collection {
  name: string;
  symbol: string;
  designer: Address;
  totalSupply: number;
}

export default function CollectionDetail() {
  const params = useParams();
  const router = useRouter();
  const collectionAddress = params.address as Address;
  const { address, isConnected } = useAccount();
  const queryClient = useQueryClient();
  
  // Read collection details from contract with caching enabled
  // Get designer from factory contract
  const { data: designer, isLoading: isLoadingDesigner, error: designerError } = useReadContract({
    address: CONTRACTS.BLUEPRINT_FACTORY?.address,
    abi: CONTRACTS.BLUEPRINT_FACTORY?.abi,
    functionName: 'getDesigner',
    args: [collectionAddress], // Pass collection address as argument
    query: {
      enabled: !!collectionAddress && !!CONTRACTS.BLUEPRINT_FACTORY?.address,
      staleTime: 5 * 60 * 1000, // 5 minutes cache
    }
  });

  // Get name from collection contract
  const { data: name, isLoading: isLoadingName, error: nameError } = useReadContract({
    abi: CONTRACTS.BLUEPRINT_NFT?.abi,
    address: collectionAddress,
    functionName: 'name',
    query: {
      enabled: !!collectionAddress,
      staleTime: 5 * 60 * 1000, // 5 minutes cache
    }
  });

  // Get symbol from collection contract
  const { data: symbol, isLoading: isLoadingSymbol, error: symbolError } = useReadContract({
    abi: CONTRACTS.BLUEPRINT_NFT?.abi,
    address: collectionAddress,
    functionName: 'symbol',
    query: {
      enabled: !!collectionAddress,
      staleTime: 5 * 60 * 1000, // 5 minutes cache
    }
  });

  // Get total supply from collection contract
  const { data: totalSupply, isLoading: isLoadingSupply, error: supplyError } = useReadContract({
    abi: CONTRACTS.BLUEPRINT_NFT?.abi,
    address: collectionAddress,
    functionName: 'totalSupply',
    query: {
      enabled: !!collectionAddress,
      staleTime: 5 * 60 * 1000, // 5 minutes cache
    }
  });

  const isLoading = isLoadingDesigner || isLoadingName || isLoadingSymbol || isLoadingSupply;
  const error = designerError || nameError || symbolError || supplyError;

  // Memoize collection object to prevent unnecessary re-renders
  const collection = useMemo(() => {
    if (name && symbol && designer && totalSupply !== undefined) {
      return {
        name: name as string,
        symbol: symbol as string,
        designer: designer as Address,
        totalSupply: Number(totalSupply),
      };
    }
    return null;
  }, [name, symbol, designer, totalSupply]);

  useEffect(() => {
    console.log('=== COLLECTION [ADDRESS] ROUTE LOADED ===');
    console.log('Collection address (blockchain):', collectionAddress);
    console.log('Wallet connected:', !!address);
    console.log('Wallet address:', address);
    console.log('CONTRACTS:', CONTRACTS);
    console.log('BLUEPRINT_FACTORY:', CONTRACTS.BLUEPRINT_FACTORY);
    console.log('BLUEPRINT_NFT:', CONTRACTS.BLUEPRINT_NFT);
    console.log('Factory address:', CONTRACTS.BLUEPRINT_FACTORY?.address);
    console.log('Factory ABI:', CONTRACTS.BLUEPRINT_FACTORY?.abi);
    console.log('NFT ABI:', CONTRACTS.BLUEPRINT_NFT?.abi);
    console.log('Is collection address valid:', !!collectionAddress);
    console.log('Is factory address valid:', !!CONTRACTS.BLUEPRINT_FACTORY?.address);
    console.log('This route uses blockchain addresses and real contract data');
    console.log('This conflicts with the [id] route which uses mock data');
  }, [collectionAddress, address]);

  // Add logging to track wallet state during navigation
  useEffect(() => {
    console.log('Collection page: Wallet state changed');
    console.log('- isConnected:', !!address);
    console.log('- address:', address);
    console.log('- collectionAddress:', collectionAddress);
  }, [address, collectionAddress]);

  // Add detailed logging for contract calls
  useEffect(() => {
    console.log('Contract call states:');
    console.log('- designer:', designer, 'loading:', isLoadingDesigner, 'error:', designerError?.message);
    console.log('- name:', name, 'loading:', isLoadingName, 'error:', nameError?.message);
    console.log('- symbol:', symbol, 'loading:', isLoadingSymbol, 'error:', symbolError?.message);
    console.log('- totalSupply:', totalSupply, 'loading:', isLoadingSupply, 'error:', supplyError?.message);
    console.log('- overall loading:', isLoading);
    console.log('- overall error:', error?.message);
    console.log('- collection object:', collection);
  }, [designer, isLoadingDesigner, designerError, name, isLoadingName, nameError,
      symbol, isLoadingSymbol, symbolError, totalSupply, isLoadingSupply, supplyError,
      isLoading, error, collection]);

  // Set up event listeners for real-time updates
  useCollectionEvents(collectionAddress, {
    onNFTMinted: useCallback((data: NFTMintedData) => {
      console.log('CollectionDetail: NFT minted event received', data);
      // Invalidate NFT-related queries to trigger refetch
      queryClient.invalidateQueries({
        queryKey: ['readContract', collectionAddress, 'totalSupply']
      });
      queryClient.invalidateQueries({
        queryKey: ['readContract', collectionAddress]
      });
      console.log('CollectionDetail: Invalidated NFT queries due to new mint');
    }, [collectionAddress, queryClient]),
  });

  if (isLoading) {
    return <PageLoading text="Loading collection details..." />;
  }

  if (!collection) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Collection Not Found</h1>
          <p className="text-gray-600 mb-4">The collection you're looking for doesn't exist</p>
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">Error: {error.message}</p>
            </div>
          )}
          <div className="mt-6">
            <Button href="/designer">Back to Dashboard</Button>
          </div>
        </div>
      </div>
    );
  }

  // Memoize isOwner check to prevent unnecessary recalculations
  const isOwner = useMemo(() => address === collection.designer, [address, collection.designer]);

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
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
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
                  <Button onClick={() => router.push(`/collection/${collectionAddress}/mint`)}>
                    Mint New NFT
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Back to Dashboard Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <Button
          onClick={() => {
            // Use programmatic navigation to maintain wallet state
            router.push('/designer');
          }}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          <span>Back to Designer Dashboard</span>
        </Button>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Collection Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Designer</p>
              <p className="font-medium font-mono text-slate-600 text-sm break-all">{collection.designer}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Total Items</p>
              <p className="font-medium text-slate-600 text-lg">{collection.totalSupply}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Contract Address</p>
              <p className="font-medium font-mono text-slate-600 text-sm break-all">{collectionAddress}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Symbol</p>
              <p className="font-medium text-slate-600 text-lg">{collection.symbol}</p>
            </div>
          </div>
          
          {/* {error && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">Warning: Some data may be incomplete. Error: {error.message}</p>
            </div>
          )}
          
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-sm">✅ Successfully loaded collection data from blockchain</p>
          </div> */}
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Items in this Collection</h2>
          <NFTGrid collectionAddress={collectionAddress} />
        </div>
      </main>
    </div>
  );
}

import { useAccount } from 'wagmi';
import { useGetCollections, useGetCollectionCount, useCreateCollection } from './useContract';
import { useCollectionDetails } from './useCollectionDetails';
import { useContractEvents } from './useContractEvents';
import { useState, useEffect, useCallback } from 'react';
import { Address } from 'viem';
import { useQueryClient } from '@tanstack/react-query';

export function useCollection() {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const { data: collectionAddresses, isLoading: isLoadingAddresses } = useGetCollections(address);
  const { data: collectionCount } = useGetCollectionCount(address);
  const { createCollection, isPending: isCreating, isConfirmed } = useCreateCollection();
  const { collections } = useCollectionDetails(collectionAddresses as Address[] | undefined);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const isLoadingCollections = isLoadingAddresses;

  // Set up event listeners for real-time updates
  useContractEvents(address, {
    onCollectionCreated: useCallback((data: any) => {
      console.log('useCollection: CollectionCreated event received', data);
      // Invalidate relevant queries to trigger refetch
      queryClient.invalidateQueries({
        queryKey: ['getCollections', address]
      });
      queryClient.invalidateQueries({
        queryKey: ['getCollectionCount', address]
      });
      console.log('useCollection: Invalidated collection queries due to new collection');
    }, [address, queryClient]),
  });

  // Debug logs to track data flow
  useEffect(() => {
    console.log('useCollection hook debug:');
    console.log('- address:', address);
    console.log('- collectionAddresses:', collectionAddresses);
    console.log('- collections from useCollectionDetails:', collections);
    console.log('- isLoadingAddresses:', isLoadingAddresses);
    console.log('- isLoadingCollections:', isLoadingCollections);
  }, [address, collectionAddresses, collections, isLoadingAddresses, isLoadingCollections]);

  // Add logging to track wallet connection state changes
  useEffect(() => {
    console.log('Wallet connection state changed:');
    console.log('- isConnected:', !!address);
    console.log('- address:', address);
  }, [address]);

  const handleCreateCollection = async (name: string, symbol: string): Promise<`0x${string}` | undefined> => {
    try {
      const result = await createCollection(name, symbol);
      // Close modal on success
      if (isConfirmed) {
        setIsCreateModalOpen(false);
      }
      return result;
    } catch (error) {
      console.error('Failed to create collection:', error);
      throw error;
    }
  };

  // Add a function to manually refetch collections after creating a new one
  const refetchCollections = useCallback(() => {
    console.log('Manually refetching collections');
    // Invalidate all collection-related queries
    queryClient.invalidateQueries({
      queryKey: ['getCollections', address]
    });
    queryClient.invalidateQueries({
      queryKey: ['getCollectionCount', address]
    });
    // Also invalidate collection details for all addresses
    if (collectionAddresses && Array.isArray(collectionAddresses)) {
      collectionAddresses.forEach((addr: Address) => {
        queryClient.invalidateQueries({
          queryKey: ['readContract', addr]
        });
      });
    }
  }, [address, collectionAddresses, queryClient]);

  return {
    collections,
    collectionCount,
    isLoadingCollections,
    isCreating,
    isConfirmed,
    isCreateModalOpen,
    setIsCreateModalOpen,
    createCollection: handleCreateCollection,
    refetchCollections, // Expose refetch function
  };
}
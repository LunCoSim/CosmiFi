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
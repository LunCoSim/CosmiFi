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
      staleTime: 10 * 60 * 1000, // 10 minutes cache
      refetchOnWindowFocus: false, // Don't refetch on window focus
    },
  });
}

export function useRegisterDesigner() {
  const { data: hash, isPending, error, writeContract } = useWriteContract();
  
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
  const { data: hash, isPending, error, writeContract } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const createCollection = async (name: string, symbol: string) => {
    console.log('useCreateCollection: Creating collection', { name, symbol });
    try {
      await writeContract({
        ...CONTRACTS.BLUEPRINT_FACTORY,
        functionName: 'createCollection',
        args: [name, symbol],
      });
      console.log('useCreateCollection: Transaction submitted');
      return hash;
    } catch (error) {
      console.error('useCreateCollection: Failed to create collection', error);
      throw error;
    }
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
      staleTime: 5 * 60 * 1000, // 5 minutes cache
      refetchOnWindowFocus: false,
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
      staleTime: 5 * 60 * 1000, // 5 minutes cache
      refetchOnWindowFocus: false,
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
      staleTime: 10 * 60 * 1000, // 10 minutes cache
      refetchOnWindowFocus: false,
    },
  });
}
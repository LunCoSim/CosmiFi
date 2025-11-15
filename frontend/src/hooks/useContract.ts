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
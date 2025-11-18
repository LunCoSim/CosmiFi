import { useReadContract } from 'wagmi';
import { useMemo, useEffect } from 'react';
import { CONTRACTS } from '../contracts';
import { Address } from 'viem';

interface Collection {
  address: Address;
  name: string;
  symbol: string;
  designer: Address;
  totalSupply: number;
}

export function useCollectionDetails(collectionAddresses: Address[] | undefined) {
  // Debug logging
  console.log('useCollectionDetails - CONTRACTS.BLUEPRINT_FACTORY:', CONTRACTS.BLUEPRINT_FACTORY);
  console.log('useCollectionDetails - collectionAddresses:', collectionAddresses);
  
  // Get the first address or undefined - this ensures hooks are always called with consistent parameters
  const firstAddress = collectionAddresses && collectionAddresses.length > 0 ? collectionAddresses[0] : undefined;
  
  console.log('useCollectionDetails - firstAddress:', firstAddress);
  console.log('useCollectionDetails - contract address:', CONTRACTS.BLUEPRINT_FACTORY?.address);
  
  // Get designer from factory contract - always call hook with consistent parameters
  const { data: designer, isLoading: isLoadingDesigner, error: designerError } = useReadContract({
    ...CONTRACTS.BLUEPRINT_FACTORY,
    address: CONTRACTS.BLUEPRINT_FACTORY?.address, // Use factory contract address, not collection address
    functionName: 'getDesigner',
    args: firstAddress ? [firstAddress] : undefined, // Pass collection address as argument
    query: {
      enabled: !!firstAddress && !!CONTRACTS.BLUEPRINT_FACTORY?.address,
      staleTime: 2 * 60 * 1000, // 2 minutes cache for faster updates
    }
  });

  // Get name from collection contract - always call hook with consistent parameters
  const { data: name, isLoading: isLoadingName, error: nameError } = useReadContract({
    abi: CONTRACTS.BLUEPRINT_NFT?.abi,
    address: firstAddress,
    functionName: 'name',
    query: {
      enabled: !!firstAddress,
      staleTime: 2 * 60 * 1000, // 2 minutes cache for faster updates
    }
  });

  // Get symbol from collection contract - always call hook with consistent parameters
  const { data: symbol, isLoading: isLoadingSymbol, error: symbolError } = useReadContract({
    abi: CONTRACTS.BLUEPRINT_NFT?.abi,
    address: firstAddress,
    functionName: 'symbol',
    query: {
      enabled: !!firstAddress,
      staleTime: 2 * 60 * 1000, // 2 minutes cache for faster updates
    }
  });

  // Get total supply from collection contract - always call hook with consistent parameters
  const { data: totalSupply, isLoading: isLoadingSupply, error: supplyError } = useReadContract({
    abi: CONTRACTS.BLUEPRINT_NFT?.abi,
    address: firstAddress,
    functionName: 'totalSupply',
    query: {
      enabled: !!firstAddress,
      staleTime: 2 * 60 * 1000, // 2 minutes cache for faster updates
    }
  });

  const isLoading = isLoadingDesigner || isLoadingName || isLoadingSymbol || isLoadingSupply;
  const error = designerError || nameError || symbolError || supplyError;

  // Debug logging for the hook result
  useEffect(() => {
    console.log('useCollectionDetails - hook result:', {
      designer,
      name,
      symbol,
      totalSupply,
      isLoading,
      error: error?.message,
      firstAddress,
      contractAddress: CONTRACTS.BLUEPRINT_FACTORY?.address
    });
  }, [designer, name, symbol, totalSupply, isLoading, error, firstAddress]);

  // Memoize the result to prevent unnecessary re-renders
  const collections = useMemo(() => {
    // Early return if no addresses or contract config is not ready
    if (!collectionAddresses || collectionAddresses.length === 0 || !firstAddress) {
      console.log('useCollectionDetails - useMemo: no collection addresses');
      return [];
    }
    
    if (!CONTRACTS.BLUEPRINT_FACTORY?.address) {
      console.log('useCollectionDetails - useMemo: no contract address');
      return [];
    }
    
    console.log('useCollectionDetails - useMemo - processing addresses:', collectionAddresses.length);
    
    // For now, only process the first collection due to React hooks limitations
    // This is a temporary fix to resolve the immediate error
    if (isLoading) {
      console.log('useCollectionDetails - useMemo: still loading');
      return [];
    }
    
    if (error) {
      console.log('useCollectionDetails - useMemo: error occurred:', error.message);
      return [];
    }
    
    if (!designer || !name || !symbol) {
      console.log('useCollectionDetails - useMemo: missing data', { designer, name, symbol });
      // Return a collection with fallback data
      const result = [{
        address: firstAddress,
        name: name || `Collection ${firstAddress.slice(0, 6)}`,
        symbol: symbol || `COL${firstAddress.slice(0, 4)}`,
        designer: designer || firstAddress, // Use address as fallback
        totalSupply: totalSupply ? Number(totalSupply) : 0,
      }];
      
      console.log('useCollectionDetails - useMemo: returning collection with fallbacks:', result);
      return result;
    }

    const result = [{
      address: firstAddress,
      name: name as string,
      symbol: symbol as string,
      designer: designer as Address,
      totalSupply: totalSupply ? Number(totalSupply) : 0,
    }];
    
    console.log('useCollectionDetails - useMemo - final collections:', result.length);
    return result;
  }, [collectionAddresses, firstAddress, designer, name, symbol, totalSupply, isLoading, error]);

  return { collections };
}
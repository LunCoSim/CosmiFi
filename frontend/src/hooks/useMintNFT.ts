import { useState, useCallback } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACTS } from '../contracts';
import { designService } from '../services/designService';
import { useAuth } from './useAuth';
import type { Design } from '../types/api';

export interface MintProgress {
  stage: 'idle' | 'signing' | 'minting' | 'confirming' | 'updating_db' | 'complete' | 'error';
  message: string;
}

/**
 * Hook for minting NFTs from designs
 */
export function useMintNFT() {
  const { address } = useAccount();
  const { getAuthHeaders } = useAuth();
  const { data: hash, isPending, error: writeError, writeContract } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });
  
  const [mintProgress, setMintProgress] = useState<MintProgress>({
    stage: 'idle',
    message: '',
  });
  const [error, setError] = useState<string | null>(null);

  /**
   * Mint an NFT from a design
   */
  const mintNFT = useCallback(async (
    design: Design,
    collectionAddress: string
  ): Promise<{ tokenId: bigint; txHash: string }> => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    if (design.status !== 'metadata_ready') {
      throw new Error('Design must have metadata ready before minting');
    }

    if (!design.metadata_cid) {
      throw new Error('Design metadata CID is missing');
    }

    setError(null);

    try {
      // Step 1: Sign and submit transaction
      setMintProgress({
        stage: 'signing',
        message: 'Please sign the transaction in your wallet...',
      });

      await writeContract({
        address: collectionAddress as `0x${string}`,
        abi: CONTRACTS.BLUEPRINT_FACTORY.abi, // Should use BlueprintNFT ABI
        functionName: 'mintDesign',
        args: [design.metadata_cid],
      });

      setMintProgress({
        stage: 'minting',
        message: 'Transaction submitted, waiting for confirmation...',
      });

      // Wait for transaction to be confirmed
      // This is handled by useWaitForTransactionReceipt hook

      return {
        tokenId: BigInt(0), // Will be extracted from event
        txHash: hash || '',
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mint NFT';
      setError(errorMessage);
      setMintProgress({
        stage: 'error',
        message: errorMessage,
      });
      throw err;
    }
  }, [address, writeContract, hash]);

  /**
   * Update design status in database after minting
   */
  const updateDesignAfterMint = useCallback(async (
    designId: number,
    tokenId: number,
    collectionAddress: string
  ): Promise<void> => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    try {
      setMintProgress({
        stage: 'updating_db',
        message: 'Updating design status...',
      });

      const authHeaders = await getAuthHeaders();
      
      await designService.updateDesign(
        {
          id: designId,
          status: 'minted',
          // Note: Backend needs to support these fields
          // token_id: tokenId,
          // collection_address: collectionAddress,
        },
        authHeaders
      );

      setMintProgress({
        stage: 'complete',
        message: 'NFT minted successfully!',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update design status';
      setError(errorMessage);
      throw err;
    }
  }, [address, getAuthHeaders]);

  /**
   * Reset mint progress
   */
  const resetMintProgress = useCallback(() => {
    setMintProgress({
      stage: 'idle',
      message: '',
    });
    setError(null);
  }, []);

  return {
    mintNFT,
    updateDesignAfterMint,
    isPending,
    isConfirming,
    isConfirmed,
    hash,
    error: error || (writeError?.message),
    mintProgress,
    resetMintProgress,
  };
}

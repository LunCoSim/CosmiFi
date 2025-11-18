import { useState, useEffect, useCallback } from 'react';
import { useWaitForTransactionReceipt, useWatchBlockNumber } from 'wagmi';
import { Hash } from 'viem';

interface TransactionStatus {
  hash: Hash;
  status: 'pending' | 'confirming' | 'confirmed' | 'failed';
  blockNumber?: bigint;
  gasUsed?: bigint;
  error?: Error;
}

interface TransactionMonitorOptions {
  onSuccess?: (hash: Hash, receipt: any) => void;
  onError?: (hash: Hash, error: Error) => void;
  onProgress?: (hash: Hash, status: TransactionStatus) => void;
}

export function useTransactionMonitor(options: TransactionMonitorOptions = {}) {
  const [transactions, setTransactions] = useState<Map<Hash, TransactionStatus>>(new Map());
  const blockNumber = useWatchBlockNumber({
    onBlockNumber: (blockNumber) => {
      // Trigger transaction checks on new blocks
      console.log('New block detected:', blockNumber);
    },
    emitOnBegin: true,
  });

  // Function to add a new transaction to monitor
  const addTransaction = useCallback((hash: Hash) => {
    console.log('TransactionMonitor: Adding transaction to monitor', hash);
    setTransactions(prev => {
      const newMap = new Map(prev);
      newMap.set(hash, {
        hash,
        status: 'pending',
      });
      return newMap;
    });
  }, []);

  // Function to remove a transaction from monitoring
  const removeTransaction = useCallback((hash: Hash) => {
    console.log('TransactionMonitor: Removing transaction from monitor', hash);
    setTransactions(prev => {
      const newMap = new Map(prev);
      newMap.delete(hash);
      return newMap;
    });
  }, []);

  // Function to get transaction status
  const getTransactionStatus = useCallback((hash: Hash): TransactionStatus | undefined => {
    return transactions.get(hash);
  }, [transactions]);

  // Function to get all pending transactions
  const getPendingTransactions = useCallback((): TransactionStatus[] => {
    return Array.from(transactions.values()).filter(tx => tx.status === 'pending' || tx.status === 'confirming');
  }, [transactions]);

  // Monitor each transaction
  useEffect(() => {
    transactions.forEach((tx, hash) => {
      if (tx.status === 'confirmed' || tx.status === 'failed') {
        return; // Skip completed transactions
      }

      // Use useWaitForTransactionReceipt for each transaction
      // Note: This is a simplified approach. In a real app, you might want to
      // use a different strategy to avoid hook rules violations
      const checkTransaction = async () => {
        try {
          const receipt = await fetch(`/api/transaction/${hash}`).then(res => res.json());
          
          if (receipt.status === 'success') {
            const newStatus: TransactionStatus = {
              hash,
              status: 'confirmed',
              blockNumber: receipt.blockNumber,
              gasUsed: receipt.gasUsed,
            };

            setTransactions(prev => {
              const newMap = new Map(prev);
              newMap.set(hash, newStatus);
              return newMap;
            });

            options.onSuccess?.(hash, receipt);
            options.onProgress?.(hash, newStatus);
          } else if (receipt.status === 'failed') {
            const newStatus: TransactionStatus = {
              hash,
              status: 'failed',
              error: new Error(receipt.error || 'Transaction failed'),
            };

            setTransactions(prev => {
              const newMap = new Map(prev);
              newMap.set(hash, newStatus);
              return newMap;
            });

            options.onError?.(hash, newStatus.error!);
            options.onProgress?.(hash, newStatus);
          }
        } catch (error) {
          console.error('TransactionMonitor: Error checking transaction', hash, error);
        }
      };

      // Check transaction status
      if (tx.status === 'pending') {
        checkTransaction();
      }
    });
  }, [transactions, blockNumber, options]);

  return {
    transactions: Array.from(transactions.values()),
    addTransaction,
    removeTransaction,
    getTransactionStatus,
    getPendingTransactions,
  };
}

// Hook for monitoring a single transaction
export function useSingleTransaction(hash?: Hash, options: TransactionMonitorOptions = {}) {
  const { data: receipt, isLoading, isSuccess, error } = useWaitForTransactionReceipt({
    hash,
  });

  const [status, setStatus] = useState<TransactionStatus | null>(null);

  useEffect(() => {
    if (!hash) return;

    if (isLoading) {
      setStatus({
        hash,
        status: 'confirming',
      });
      options.onProgress?.(hash, { hash, status: 'confirming' });
    } else if (isSuccess && receipt) {
      const newStatus: TransactionStatus = {
        hash,
        status: 'confirmed',
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed,
      };
      setStatus(newStatus);
      options.onSuccess?.(hash, receipt);
      options.onProgress?.(hash, newStatus);
    } else if (error) {
      const newStatus: TransactionStatus = {
        hash,
        status: 'failed',
        error,
      };
      setStatus(newStatus);
      options.onError?.(hash, error);
      options.onProgress?.(hash, newStatus);
    }
  }, [hash, isLoading, isSuccess, error, receipt, options]);

  return status;
}
'use client';

import { useEffect, useState } from 'react';
import { useWaitForTransactionReceipt } from 'wagmi';
import { CheckCircleIcon, ExclamationCircleIcon, ClockIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { Button } from './ui/Button';
import { useSingleTransaction } from '../hooks/useTransactionMonitor';

interface TransactionStatusProps {
  hash?: `0x${string}`;
  onSuccess?: () => void;
  onError?: () => void;
  onProgress?: (status: string) => void;
}

export function TransactionStatus({ hash, onSuccess, onError, onProgress }: TransactionStatusProps) {
  const [showDetails, setShowDetails] = useState(false);
  
  // Use our enhanced transaction monitoring
  const transactionStatus = useSingleTransaction(hash, {
    onSuccess: () => {
      console.log('TransactionStatus: Transaction confirmed', hash);
      onSuccess?.();
    },
    onError: (hash, error) => {
      console.error('TransactionStatus: Transaction failed', hash, error);
      onError?.();
    },
    onProgress: (hash, status) => {
      console.log('TransactionStatus: Transaction progress', hash, status);
      onProgress?.(status.status);
    },
  });

  // Fallback to wagmi's hook if our custom hook doesn't provide data
  const { data, isLoading, isSuccess, isError, error } = useWaitForTransactionReceipt({
    hash,
  });

  // Determine the current status
  const currentStatus = transactionStatus || {
    hash,
    status: isLoading ? 'confirming' : isSuccess ? 'confirmed' : isError ? 'failed' : 'pending',
    blockNumber: data?.blockNumber,
    gasUsed: data?.gasUsed,
    error,
  };

  useEffect(() => {
    if (isSuccess && onSuccess && !transactionStatus) {
      onSuccess();
    }
    if (isError && onError && !transactionStatus) {
      onError();
    }
  }, [isSuccess, isError, onSuccess, onError, transactionStatus]);

  if (!hash) return null;

  const getStatusIcon = () => {
    switch (currentStatus.status) {
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-gray-500 mr-2" />;
      case 'confirming':
        return <ArrowPathIcon className="h-5 w-5 text-yellow-500 mr-2 animate-spin" />;
      case 'confirmed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />;
      case 'failed':
        return <ExclamationCircleIcon className="h-5 w-5 text-red-500 mr-2" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500 mr-2" />;
    }
  };

  const getStatusText = () => {
    switch (currentStatus.status) {
      case 'pending':
        return 'Transaction Pending...';
      case 'confirming':
        return 'Confirming Transaction...';
      case 'confirmed':
        return 'Transaction Successful';
      case 'failed':
        return 'Transaction Failed';
      default:
        return 'Transaction Pending...';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {getStatusIcon()}
          
          <div>
            <p className="font-medium">
              {getStatusText()}
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
            
            <div>
              <span className="text-gray-500">Status:</span>
              <p className="font-medium capitalize">{currentStatus.status}</p>
            </div>
            
            {currentStatus.blockNumber && (
              <div>
                <span className="text-gray-500">Block Number:</span>
                <p className="font-medium">{currentStatus.blockNumber.toString()}</p>
              </div>
            )}
            
            {currentStatus.gasUsed && (
              <div>
                <span className="text-gray-500">Gas Used:</span>
                <p className="font-medium">{currentStatus.gasUsed.toString()}</p>
              </div>
            )}
            
            {currentStatus.error && (
              <div className="md:col-span-2">
                <span className="text-gray-500">Error:</span>
                <p className="text-red-600">{currentStatus.error.message}</p>
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
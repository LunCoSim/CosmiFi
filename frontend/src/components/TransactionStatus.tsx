'use client';

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
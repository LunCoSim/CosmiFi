'use client';

import { useAccount, useBalance, useDisconnect } from 'wagmi';
import { formatEther } from 'viem';
import { Button } from '../ui/Button';

export function WalletInfo() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const { disconnect } = useDisconnect();

  if (!isConnected || !address) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">Wallet Info</h3>
        <Button variant="outline" size="sm" onClick={() => disconnect()}>
          Disconnect
        </Button>
      </div>
      
      <div className="space-y-2">
        <div>
          <span className="text-gray-500 text-sm">Address:</span>
          <p className="font-mono text-sm break-all">{address}</p>
        </div>
        
        {balance && (
          <div>
            <span className="text-gray-500 text-sm">Balance:</span>
            <p className="font-semibold">
              {parseFloat(formatEther(balance.value)).toFixed(4)} {balance.symbol}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
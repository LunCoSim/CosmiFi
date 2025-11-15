import { Address } from 'viem';
import { formatAddress } from '../../utils/formatters';
import { Button } from '../ui/Button';

interface CollectionCardProps {
  address: Address;
  name: string;
  symbol: string;
  designer: Address;
  totalSupply: number;
  onView?: () => void;
  onMint?: () => void;
  isOwner?: boolean;
}

export function CollectionCard({
  address,
  name,
  symbol,
  designer,
  totalSupply,
  onView,
  onMint,
  isOwner = false,
}: CollectionCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{name}</h3>
            <p className="text-sm text-gray-500">{symbol}</p>
          </div>
          <div className="bg-primary-100 text-primary-800 text-xs font-medium px-2.5 py-0.5 rounded">
            {totalSupply} items
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Designer: <span className="font-medium">{formatAddress(designer)}</span>
          </p>
          <p className="text-sm text-gray-600">
            Contract: <span className="font-medium font-mono text-xs">{formatAddress(address)}</span>
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onView}
            className="flex-1"
          >
            View Collection
          </Button>
          
          {isOwner && (
            <Button
              size="sm"
              onClick={onMint}
              className="flex-1"
            >
              Mint NFT
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
import { Address } from 'viem';

interface NFTGridProps {
  collectionAddress: Address;
}

export function NFTGrid({ collectionAddress }: NFTGridProps) {
  // This is a placeholder implementation
  // In a real app, you would fetch NFTs from the collection
  return (
    <div className="text-center py-12">
      <div className="text-gray-500 text-lg mb-4">No NFTs found</div>
      <p className="text-gray-400">
        This collection doesn't have any NFTs yet
      </p>
    </div>
  );
}
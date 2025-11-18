import { CollectionCard } from './CollectionCard';
import { Address } from 'viem';
import { useEffect } from 'react';

interface Collection {
  address: Address;
  name: string;
  symbol: string;
  designer: Address;
  totalSupply: number;
}

interface CollectionGridProps {
  collections: Collection[];
  currentDesignerAddress?: Address;
  onViewCollection: (collection: Collection) => void;
  onMintNFT: (collection: Collection) => void;
  isLoading?: boolean;
}

export function CollectionGrid({
  collections,
  currentDesignerAddress,
  onViewCollection,
  onMintNFT,
  isLoading = false,
}: CollectionGridProps) {
  // Debug logs to track data flow
  useEffect(() => {
    console.log('CollectionGrid debug:');
    console.log('- collections length:', collections.length);
    console.log('- currentDesignerAddress:', currentDesignerAddress);
    console.log('- isLoading:', isLoading);
    
    if (collections.length > 0) {
      console.log('- First collection:', collections[0]);
      console.log('- All collections:', collections);
    }
  }, [collections, currentDesignerAddress, isLoading]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
            <div className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-4"></div>
              <div className="flex gap-2">
                <div className="h-8 bg-gray-200 rounded flex-1"></div>
                <div className="h-8 bg-gray-200 rounded flex-1"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (collections.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-4">No collections found</div>
        <p className="text-gray-400">
          Create your first collection to start minting NFTs
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {collections.map((collection, index) => {
        console.log(`Rendering collection ${index}:`, collection);
        return (
          <CollectionCard
            key={collection.address}
            address={collection.address}
            name={collection.name}
            symbol={collection.symbol}
            designer={collection.designer}
            totalSupply={collection.totalSupply}
            isOwner={currentDesignerAddress === collection.designer}
            onView={() => onViewCollection(collection)}
            onMint={() => onMintNFT(collection)}
          />
        );
      })}
    </div>
  );
}
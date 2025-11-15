'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { formatEther } from 'viem';
import { CONTRACTS } from '../../../src/contracts';
import { Address } from 'viem';
import { Button } from '../../../src/components/ui/Button';
import { NFTGrid } from '../../../src/components/nft/NFTGrid';

interface Collection {
  name: string;
  symbol: string;
  designer: Address;
  totalSupply: number;
}

export default function CollectionDetail() {
  const params = useParams();
  const collectionAddress = params.address as Address;
  const { address } = useAccount();
  
  const [collection, setCollection] = useState<Collection | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Read collection details from contract
  const { data: name } = useReadContract({
    ...CONTRACTS.BLUEPRINT_FACTORY,
    address: collectionAddress,
    functionName: 'name',
  });

  const { data: symbol } = useReadContract({
    ...CONTRACTS.BLUEPRINT_FACTORY,
    address: collectionAddress,
    functionName: 'symbol',
  });

  const { data: designer } = useReadContract({
    ...CONTRACTS.BLUEPRINT_FACTORY,
    address: collectionAddress,
    functionName: 'designer',
  });

  const { data: totalSupply } = useReadContract({
    ...CONTRACTS.BLUEPRINT_FACTORY,
    address: collectionAddress,
    functionName: 'totalSupply',
  });

  useEffect(() => {
    console.log('Collection detail page loaded');
    console.log('Collection address:', collectionAddress);
    console.log('Wallet connected:', !!address);
    console.log('Wallet address:', address);
    console.log('Contract data - name:', name);
    console.log('Contract data - symbol:', symbol);
    console.log('Contract data - designer:', designer);
    console.log('Contract data - totalSupply:', totalSupply);
    
    if (name && symbol && designer && totalSupply !== undefined) {
      setCollection({
        name: name as string,
        symbol: symbol as string,
        designer: designer as Address,
        totalSupply: Number(totalSupply),
      });
      setIsLoading(false);
    }
  }, [name, symbol, designer, totalSupply, collectionAddress, address]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Collection Not Found</h1>
          <p className="text-gray-600">The collection you're looking for doesn't exist</p>
        </div>
      </div>
    );
  }

  const isOwner = address === collection.designer;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <nav className="flex mb-4" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-4">
                <li>
                  <a href="/designer" className="text-gray-500 hover:text-gray-700">
                    Dashboard
                  </a>
                </li>
                <li>
                  <div className="flex items-center">
                    <svg
                      className="flex-shrink-0 h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <a
                      href={`/collection/${collectionAddress}`}
                      className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700"
                    >
                      {collection.name}
                    </a>
                  </div>
                </li>
              </ol>
            </nav>
            
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{collection.name}</h1>
                <p className="text-gray-600">{collection.symbol}</p>
              </div>
              
              {isOwner && (
                <div className="mt-4 md:mt-0">
                  <Button href={`/collection/${collectionAddress}/mint`}>
                    Mint New NFT
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Collection Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-500">Designer</p>
              <p className="font-medium">{collection.designer}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Total Items</p>
              <p className="font-medium">{collection.totalSupply}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Contract Address</p>
              <p className="font-medium font-mono text-sm">{collectionAddress}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Symbol</p>
              <p className="font-medium">{collection.symbol}</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Items in this Collection</h2>
          <NFTGrid collectionAddress={collectionAddress} />
        </div>
      </main>
    </div>
  );
}
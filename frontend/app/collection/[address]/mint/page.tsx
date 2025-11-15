'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { CONTRACTS } from '../../../../src/contracts';
import { Address } from 'viem';
import { Button } from '../../../../src/components/ui/Button';

interface Collection {
  name: string;
  symbol: string;
  designer: Address;
}

export default function MintNFTPage() {
  const params = useParams();
  const router = useRouter();
  const collectionAddress = params.address as Address;
  const { address, isConnected } = useAccount();
  
  const [collection, setCollection] = useState<Collection | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('Mint page loaded for collection:', collectionAddress);
    console.log('Wallet connected:', isConnected);
    console.log('Wallet address:', address);
  }, [collectionAddress, isConnected, address]);

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

  useEffect(() => {
    if (name && symbol && designer) {
      setCollection({
        name: name as string,
        symbol: symbol as string,
        designer: designer as Address,
      });
      setIsLoading(false);
    }
  }, [name, symbol, designer]);

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h1>
          <p className="text-gray-600 mb-6">Please connect your wallet to mint NFTs</p>
        </div>
      </div>
    );
  }

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
          <p className="text-gray-600">The collection you're trying to mint to doesn't exist</p>
        </div>
      </div>
    );
  }

  const isOwner = address === collection.designer;

  if (!isOwner) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">Only the collection owner can mint new NFTs</p>
          <Button onClick={() => router.push(`/collection/${collectionAddress}`)}>
            Back to Collection
          </Button>
        </div>
      </div>
    );
  }

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
                    <span className="ml-4 text-sm font-medium text-gray-500">
                      Mint NFT
                    </span>
                  </div>
                </li>
              </ol>
            </nav>
            
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Mint New NFT</h1>
                <p className="text-gray-600">{collection.name}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Mint NFT Feature Coming Soon</h2>
          
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
            <p className="text-blue-800">
              The NFT minting feature is currently under development. This page will allow you to:
            </p>
            <ul className="list-disc list-inside mt-2 text-blue-800">
              <li>Upload design files</li>
              <li>Set NFT metadata</li>
              <li>Mint new NFTs to your collection</li>
            </ul>
          </div>

          <div className="flex space-x-4">
            <Button onClick={() => router.push(`/collection/${collectionAddress}`)}>
              Back to Collection
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
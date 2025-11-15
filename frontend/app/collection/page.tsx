'use client';

import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import Link from 'next/link';

export default function CollectionsPage() {
  const { isConnected } = useAccount();

  useEffect(() => {
    console.log('Collections page loaded');
    console.log('Wallet connected:', isConnected);
  }, [isConnected]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-2xl font-bold text-gray-900">Collections</h1>
            <p className="text-gray-600">Browse and discover NFT collections</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isConnected ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h2>
            <p className="text-gray-600 mb-6">Please connect your wallet to view collections</p>
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Collections Coming Soon</h2>
            <p className="text-gray-600 mb-6">
              The collections feature is currently under development. Check back soon!
            </p>
            <Link 
              href="/designer" 
              className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Go to Designer Dashboard
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import Image from 'next/image';
import { 
  UserIcon,
  SparklesIcon,
  EyeIcon,
  HeartIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';

// Mock data for collections
const collectionsData = [
  {
    id: 1,
    name: "Moon Explorers",
    designer: "Alex Chen",
    designerAddress: "0x1234...5678",
    description: "Modular rover designs and exploration equipment for lunar surface missions",
    image: "/api/placeholder/600/400",
    itemsCount: 12,
    views: 1280,
    likes: 342,
    category: "Exploration"
  },
  {
    id: 2,
    name: "Orbital Components",
    designer: "Sarah Johnson",
    designerAddress: "0xabcd...efgh",
    description: "Universal docking systems and connectors for space station infrastructure",
    image: "/api/placeholder/600/400",
    itemsCount: 8,
    views: 956,
    likes: 287,
    category: "Infrastructure"
  },
  {
    id: 3,
    name: "Red Planet Living",
    designer: "Michael Rodriguez",
    designerAddress: "0x9876...5432",
    description: "Habitat solutions and life support systems for Mars colonization",
    image: "/api/placeholder/600/400",
    itemsCount: 15,
    views: 2103,
    likes: 567,
    category: "Habitat"
  },
  {
    id: 4,
    name: "Space Mining",
    designer: "Emma Wilson",
    designerAddress: "0xijkl...mnop",
    description: "Autonomous drones and equipment for asteroid resource extraction",
    image: "/api/placeholder/600/400",
    itemsCount: 10,
    views: 1874,
    likes: 423,
    category: "Mining"
  },
  {
    id: 5,
    name: "Launch Solutions",
    designer: "David Kim",
    designerAddress: "0xqrst...uvwx",
    description: "Deployment mechanisms and payload systems for space launches",
    image: "/api/placeholder/600/400",
    itemsCount: 6,
    views: 1123,
    likes: 198,
    category: "Launch"
  },
  {
    id: 6,
    name: "Space Factory",
    designer: "Lisa Anderson",
    designerAddress: "0yzab...cdef",
    description: "Manufacturing systems and 3D printing solutions for zero-gravity environments",
    image: "/api/placeholder/600/400",
    itemsCount: 9,
    views: 1567,
    likes: 389,
    category: "Manufacturing"
  }
];

export default function CollectionsPage() {
  const { isConnected } = useAccount();
  const [collections, setCollections] = useState(collectionsData);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    console.log('Collections page loaded');
    console.log('Wallet connected:', isConnected);
  }, [isConnected]);

  const categories = ['all', ...Array.from(new Set(collections.map(c => c.category)))];

  const filteredCollections = filter === 'all' 
    ? collections 
    : collections.filter(c => c.category === filter);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Collections</h1>
                <p className="text-gray-600 mt-1">Discover space engineering design collections from our community</p>
              </div>
              {isConnected && (
                <Link 
                  href="/designer" 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Create Collection
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isConnected ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-sm p-8 max-w-md mx-auto">
              <UserIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h2>
              <p className="text-gray-600 mb-6">Connect your wallet to browse collections and connect with designers</p>
            </div>
          </div>
        ) : (
          <>
            {/* Filter Tabs */}
            <div className="mb-8">
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setFilter(category)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      filter === category
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                    }`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Collections Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCollections.map((collection) => (
                <div key={collection.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
                  {/* Collection Image */}
                  <div className="relative aspect-video overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                      <SparklesIcon className="h-16 w-16 text-blue-600 opacity-50" />
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                    
                    {/* Category Badge */}
                    <div className="absolute top-4 left-4">
                      <span className="bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded-full">
                        {collection.category}
                      </span>
                    </div>
                  </div>

                  {/* Collection Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{collection.name}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{collection.description}</p>
                    
                    {/* Designer Info */}
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mr-3"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{collection.designer}</p>
                        <p className="text-xs text-gray-500">{collection.designerAddress}</p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>{collection.itemsCount} items</span>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center">
                          <EyeIcon className="h-4 w-4 mr-1" />
                          {collection.views}
                        </div>
                        <div className="flex items-center">
                          <HeartIcon className="h-4 w-4 mr-1" />
                          {collection.likes}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Link
                        href={`/collection/${collection.id}`}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-center"
                      >
                        View NFTs
                      </Link>
                      <Link
                        href={`/designer/${collection.designerAddress}`}
                        className="flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        title="View Designer Bio"
                      >
                        <UserIcon className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {filteredCollections.length === 0 && (
              <div className="text-center py-12">
                <SparklesIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No collections found</h3>
                <p className="text-gray-600">Try selecting a different category</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
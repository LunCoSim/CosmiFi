'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  UserIcon,
  SparklesIcon,
  EyeIcon,
  HeartIcon,
  ArrowLeftIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';
import { Button } from '../../../src/components/ui/Button';

// Mock data for collections and their NFTs
const mockCollectionData = {
  1: {
    id: 1,
    name: "Moon Explorers",
    designer: "Alex Chen",
    designerAddress: "0x1234...5678",
    description: "Modular rover designs and exploration equipment for lunar surface missions",
    image: "/api/placeholder/1200/400",
    itemsCount: 12,
    views: 1280,
    likes: 342,
    category: "Exploration",
    createdDate: "January 2024",
    blockchain: "Base Sepolia",
    contractAddress: "0x1234...abcd"
  },
  2: {
    id: 2,
    name: "Orbital Components",
    designer: "Sarah Johnson",
    designerAddress: "0xabcd...efgh",
    description: "Universal docking systems and connectors for space station infrastructure",
    image: "/api/placeholder/1200/400",
    itemsCount: 8,
    views: 956,
    likes: 287,
    category: "Infrastructure",
    createdDate: "March 2024",
    blockchain: "Base Sepolia",
    contractAddress: "0xabcd...1234"
  },
  3: {
    id: 3,
    name: "Red Planet Living",
    designer: "Michael Rodriguez",
    designerAddress: "0x9876...5432",
    description: "Habitat solutions and life support systems for Mars colonization",
    image: "/api/placeholder/1200/400",
    itemsCount: 15,
    views: 2103,
    likes: 567,
    category: "Habitat",
    createdDate: "February 2024",
    blockchain: "Base Sepolia",
    contractAddress: "0x9876...abcd"
  }
};

const mockNFTsData = {
  1: [
    {
      id: 1,
      title: "Lunar Rover Module",
      description: "Modular rover chassis designed for lunar terrain navigation",
      image: "/api/placeholder/400/400",
      views: 128,
      likes: 42,
      mintDate: "2024-01-15",
      tokenId: "001"
    },
    {
      id: 2,
      title: "Solar Panel Array",
      description: "High-efficiency solar panels for lunar power generation",
      image: "/api/placeholder/400/400",
      views: 95,
      likes: 38,
      mintDate: "2024-01-16",
      tokenId: "002"
    },
    {
      id: 3,
      title: "Communication Antenna",
      description: "Long-range communication system for lunar missions",
      image: "/api/placeholder/400/400",
      views: 87,
      likes: 31,
      mintDate: "2024-01-17",
      tokenId: "003"
    },
    {
      id: 4,
      title: "Storage Container",
      description: "Pressurized storage for lunar sample collection",
      image: "/api/placeholder/400/400",
      views: 76,
      likes: 28,
      mintDate: "2024-01-18",
      tokenId: "004"
    },
    {
      id: 5,
      title: "Navigation System",
      description: "GPS navigation system optimized for lunar coordinates",
      image: "/api/placeholder/400/400",
      views: 92,
      likes: 35,
      mintDate: "2024-01-20",
      tokenId: "005"
    },
    {
      id: 6,
      title: "Drilling Equipment",
      description: "Core drilling system for lunar subsurface exploration",
      image: "/api/placeholder/400/400",
      views: 103,
      likes: 41,
      mintDate: "2024-01-22",
      tokenId: "006"
    }
  ],
  2: [
    {
      id: 7,
      title: "Universal Docking Port",
      description: "Standardized docking mechanism for space station modules",
      image: "/api/placeholder/400/400",
      views: 112,
      likes: 37,
      mintDate: "2024-03-10",
      tokenId: "001"
    },
    {
      id: 8,
      title: "Connector Assembly",
      description: "Multi-purpose connector for orbital infrastructure",
      image: "/api/placeholder/400/400",
      views: 89,
      likes: 29,
      mintDate: "2024-03-12",
      tokenId: "002"
    }
  ],
  3: [
    {
      id: 9,
      title: "Habitat Module",
      description: "Inflatable habitat structure for Mars colonization",
      image: "/api/placeholder/400/400",
      views: 145,
      likes: 58,
      mintDate: "2024-02-05",
      tokenId: "001"
    }
  ]
};

export default function CollectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const collectionId = params.id as string;
  const [likedNFTs, setLikedNFTs] = useState<number[]>([]);

  // Mock data - in real app, this would come from API
  const collection = mockCollectionData[collectionId as unknown as keyof typeof mockCollectionData];
  const nfts = mockNFTsData[collectionId as unknown as keyof typeof mockNFTsData] || [];

  const toggleLike = (nftId: number) => {
    setLikedNFTs(prev => 
      prev.includes(nftId) 
        ? prev.filter(id => id !== nftId)
        : [...prev, nftId]
    );
  };

  if (!collection) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <SparklesIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Collection Not Found</h2>
          <p className="text-gray-600 mb-4">The collection you're looking for doesn't exist</p>
          <Link href="/collection">
            <Button>Browse Collections</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to Collections
            </button>
          </div>
        </div>
      </header>

      {/* Collection Hero */}
      <div className="relative h-64 sm:h-80 md:h-96">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100">
          <SparklesIcon className="absolute inset-0 w-full h-full text-blue-600 opacity-10" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {collection.name}
            </h1>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
              <span>by {collection.designer}</span>
              <span>•</span>
              <span>{collection.itemsCount} items</span>
            </div>
          </div>
        </div>
      </div>

      {/* Collection Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 -mt-16 relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column - Collection Details */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About this Collection</h2>
              <p className="text-gray-700 mb-6 leading-relaxed">{collection.description}</p>
              
              {/* Collection Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-gray-900">{collection.itemsCount}</div>
                  <div className="text-sm text-gray-500">Items</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-gray-900">{collection.views}</div>
                  <div className="text-sm text-gray-500">Total Views</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-gray-900">{collection.likes}</div>
                  <div className="text-sm text-gray-500">Total Likes</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-gray-900">{collection.createdDate}</div>
                  <div className="text-sm text-gray-500">Created</div>
                </div>
              </div>

              {/* Designer Info */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Created by</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mr-3"></div>
                    <div>
                      <p className="font-medium text-gray-900">{collection.designer}</p>
                      <p className="text-sm text-gray-500">{collection.designerAddress}</p>
                    </div>
                  </div>
                  <Link 
                    href={`/designer/${collection.designerAddress}`}
                    className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View Profile
                    <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Column - Contract Info */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Contract Details</h2>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Contract Address</p>
                  <p className="font-mono text-sm text-gray-900 break-all">{collection.contractAddress}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Blockchain</p>
                  <p className="text-sm text-gray-900">{collection.blockchain}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Category</p>
                  <p className="text-sm text-gray-900">{collection.category}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 space-y-3">
                <Button className="w-full">
                  Mint New NFT
                </Button>
                <Button variant="outline" className="w-full">
                  Share Collection
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* NFTs Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">NFTs in this Collection</h2>
          <p className="text-gray-600 mt-1">Browse all {collection.itemsCount} items in {collection.name}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {nfts.map((nft) => (
            <div key={nft.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow group">
              {/* NFT Image */}
              <div className="relative aspect-square overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                  <SparklesIcon className="h-12 w-12 text-blue-600 opacity-50" />
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                
                {/* Like Button Overlay */}
                <button
                  onClick={() => toggleLike(nft.id)}
                  className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-colors"
                >
                  {likedNFTs.includes(nft.id) ? (
                    <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 0L16.828 12a4 4 0 01-5.656 0L10 14.828l-1.172-1.171a4 4 0 00-5.656 0L3.172 12a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0L4.318 12.682a4.5 4.5 0 010 6.364L12 20.364z" />
                    </svg>
                  )}
                </button>
              </div>

              {/* NFT Content */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 truncate">{nft.title}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{nft.description}</p>
                
                {/* NFT Meta */}
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>Token #{nft.tokenId}</span>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      <EyeIcon className="h-4 w-4 mr-1" />
                      {nft.views}
                    </div>
                    <div className="flex items-center">
                      <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0L4.318 12.682a4.5 4.5 0 010 6.364L12 20.364z" />
                      </svg>
                      {nft.likes + (likedNFTs.includes(nft.id) ? 1 : 0)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {nfts.length === 0 && (
          <div className="text-center py-12">
            <SparklesIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No NFTs yet</h3>
            <p className="text-gray-600">This collection doesn't have any NFTs yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
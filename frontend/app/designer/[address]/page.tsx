'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  UserIcon,
  SparklesIcon,
  EyeIcon,
  HeartIcon,
  ArrowTopRightOnSquareIcon,
  CalendarIcon,
  MapPinIcon,
  LinkIcon
} from '@heroicons/react/24/outline';
import { Button } from '../../../src/components/ui/Button';

// Mock data for demonstration
const mockDesignerData = {
  "0x1234...5678": {
    name: "Alex Chen",
    address: "0x1234...5678",
    bio: "Aerospace engineer specializing in modular rover designs and lunar exploration equipment. Passionate about making space exploration more accessible through open-source designs.",
    avatar: "/api/placeholder/200/200",
    coverImage: "/api/placeholder/1200/400",
    location: "San Francisco, CA",
    website: "alexchen.space",
    joinedDate: "January 2024",
    totalDesigns: 12,
    totalViews: 5420,
    totalLikes: 1287,
    followers: 342,
    following: 89,
    verified: true,
    socials: {
      farcaster: "alexchen",
      zora: "alexchen.eth",
      x: "alexchen_space"
    }
  },
  "0xabcd...efgh": {
    name: "Sarah Johnson",
    address: "0xabcd...efgh",
    bio: "Mechanical engineer focused on space station infrastructure and universal docking systems. Building the future of orbital construction.",
    avatar: "/api/placeholder/200/200",
    coverImage: "/api/placeholder/1200/400",
    location: "Houston, TX",
    website: "sarahjohnson.engineering",
    joinedDate: "March 2024",
    totalDesigns: 8,
    totalViews: 3210,
    totalLikes: 892,
    followers: 256,
    following: 67,
    verified: true,
    socials: {
      farcaster: "sarahj",
      zora: "sarahjohnson.eth",
      x: "sarahj_eng"
    }
  }
};

const mockCollections = {
  "0x1234...5678": [
    {
      id: 1,
      name: "Moon Explorers",
      description: "Modular rover designs and exploration equipment for lunar surface missions",
      image: "/api/placeholder/400/400",
      itemsCount: 12,
      views: 1280,
      likes: 342
    },
    {
      id: 2,
      name: "Lunar Base Components",
      description: "Essential components for building sustainable lunar habitats",
      image: "/api/placeholder/400/400",
      itemsCount: 8,
      views: 956,
      likes: 287
    }
  ],
  "0xabcd...efgh": [
    {
      id: 3,
      name: "Orbital Components",
      description: "Universal docking systems and connectors for space station infrastructure",
      image: "/api/placeholder/400/400",
      itemsCount: 8,
      views: 956,
      likes: 287
    }
  ]
};

const mockNFTs = {
  "0x1234...5678": [
    {
      id: 1,
      title: "Lunar Rover Module",
      image: "/api/placeholder/300/300",
      collection: "Moon Explorers",
      views: 128,
      likes: 42
    },
    {
      id: 2,
      title: "Solar Panel Array",
      image: "/api/placeholder/300/300",
      collection: "Moon Explorers",
      views: 95,
      likes: 38
    },
    {
      id: 3,
      title: "Communication Antenna",
      image: "/api/placeholder/300/300",
      collection: "Lunar Base Components",
      views: 87,
      likes: 31
    },
    {
      id: 4,
      title: "Storage Container",
      image: "/api/placeholder/300/300",
      collection: "Lunar Base Components",
      views: 76,
      likes: 28
    }
  ]
};

export default function DesignerProfilePage() {
  const params = useParams();
  const address = params.address as string;
  const [activeTab, setActiveTab] = useState<'collections' | 'nfts'>('collections');
  const [isFollowing, setIsFollowing] = useState(false);

  // Mock data - in real app, this would come from API
  const designer = mockDesignerData[address as keyof typeof mockDesignerData] || {
    name: "Unknown Designer",
    address: address,
    bio: "No bio available",
    avatar: "/api/placeholder/200/200",
    coverImage: "/api/placeholder/1200/400",
    location: "Unknown",
    website: "",
    joinedDate: "Unknown",
    totalDesigns: 0,
    totalViews: 0,
    totalLikes: 0,
    followers: 0,
    following: 0,
    verified: false
  };

  const collections = mockCollections[address as keyof typeof mockCollections] || [];
  const nfts = mockNFTs[address as keyof typeof mockNFTs] || [];

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
  };

  if (!designer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <UserIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Designer Not Found</h2>
          <p className="text-gray-600 mb-4">The designer you're looking for doesn't exist</p>
          <Link href="/collection">
            <Button>Browse Collections</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Cover Image */}
      <div className="relative h-64 sm:h-80 md:h-96 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-black/30"></div>
          {/* Decorative elements */}
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-white/5 rounded-full blur-lg"></div>
        </div>
      </div>

      {/* Profile Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-20 sm:-mt-24">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-6 sm:p-8 border border-white/20">
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-6 sm:space-y-0 sm:space-x-8">
              {/* Avatar */}
              <div className="relative group">
                <div className="w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-full border-4 border-white shadow-2xl ring-4 ring-blue-100 ring-opacity-50 group-hover:scale-105 transition-all duration-300"></div>
                  {designer.verified && (
                    <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full p-2 border-3 border-white shadow-lg">
                      <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  {/* Avatar glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl group-hover:from-blue-400/30 group-hover:to-purple-400/30 transition-all duration-300"></div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-3">
                  {designer.name}
                  {designer.verified && (
                    <span className="ml-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border border-blue-200">
                      <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Verified
                    </span>
                  )}
                </h1>
                <div className="flex items-center justify-center sm:justify-start mb-3">
                  <div className="bg-gray-100 px-3 py-1 rounded-full text-sm font-mono text-gray-600 border border-gray-200">
                    {designer.address}
                  </div>
                </div>
                <p className="text-gray-700 text-lg leading-relaxed mb-6 max-w-3xl font-medium">{designer.bio}</p>
                
                {/* Meta Info */}
                <div className="flex flex-wrap justify-center sm:justify-start gap-6 text-sm text-gray-600 mb-6">
                  {designer.location && (
                    <div className="flex items-center bg-blue-50 px-3 py-2 rounded-lg">
                      <MapPinIcon className="h-5 w-5 mr-2 text-blue-600" />
                      <span className="font-medium">{designer.location}</span>
                    </div>
                  )}
                  {designer.website && (
                    <div className="flex items-center bg-purple-50 px-3 py-2 rounded-lg">
                      <LinkIcon className="h-5 w-5 mr-2 text-purple-600" />
                      <a href={`https://${designer.website}`} target="_blank" rel="noopener noreferrer" className="font-medium text-purple-700 hover:text-purple-800 transition-colors">
                        {designer.website}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center bg-indigo-50 px-3 py-2 rounded-lg">
                    <CalendarIcon className="h-5 w-5 mr-2 text-indigo-600" />
                    <span className="font-medium">Joined {designer.joinedDate}</span>
                  </div>
                </div>

                {/* Social Links */}
                {designer.socials && (designer.socials.farcaster || designer.socials.zora || designer.socials.x) && (
                  <div className="flex flex-wrap justify-center sm:justify-start gap-3 mb-6">
                    {designer.socials.farcaster && (
                      <a
                        href={`https://warpcast.com/${designer.socials.farcaster}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 rounded-full transition-all duration-300 hover:scale-110 shadow-lg"
                        title="Farcaster"
                      >
                        <svg className="w-6 h-6 text-white group-hover:rotate-12 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                        </svg>
                      </a>
                    )}
                    {designer.socials.zora && (
                      <a
                        href={`https://zora.co/${designer.socials.zora}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-full transition-all duration-300 hover:scale-110 shadow-lg"
                        title="Zora"
                      >
                        <svg className="w-6 h-6 text-white group-hover:rotate-12 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                      </a>
                    )}
                    {designer.socials.x && (
                      <a
                        href={`https://x.com/${designer.socials.x}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center justify-center w-12 h-12 bg-gradient-to-br from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 rounded-full transition-all duration-300 hover:scale-110 shadow-lg"
                        title="X (Twitter)"
                      >
                        <svg className="w-6 h-6 text-white group-hover:rotate-12 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                      </a>
                    )}
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center border border-blue-200">
                    <div className="text-2xl sm:text-3xl font-bold text-blue-900">{designer.totalDesigns}</div>
                    <div className="text-sm text-blue-700 font-medium">Designs</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center border border-purple-200">
                    <div className="text-2xl sm:text-3xl font-bold text-purple-900">{designer.followers}</div>
                    <div className="text-sm text-purple-700 font-medium">Followers</div>
                  </div>
                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 text-center border border-indigo-200">
                    <div className="text-2xl sm:text-3xl font-bold text-indigo-900">{designer.totalViews}</div>
                    <div className="text-sm text-indigo-700 font-medium">Views</div>
                  </div>
                  <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-4 text-center border border-pink-200">
                    <div className="text-2xl sm:text-3xl font-bold text-pink-900">{designer.totalLikes}</div>
                    <div className="text-sm text-pink-700 font-medium">Likes</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                  <Button
                    variant={isFollowing ? "outline" : "primary"}
                    onClick={handleFollow}
                    className="px-6 py-3 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {isFollowing ? "Following" : "Follow"}
                  </Button>
                  <Button variant="outline" className="px-6 py-3 text-base font-semibold shadow-md hover:shadow-lg transition-all duration-300">
                    Message
                  </Button>
                  <Button variant="outline" className="px-6 py-3 text-base font-semibold shadow-md hover:shadow-lg transition-all duration-300">
                    Share Profile
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="mt-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('collections')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'collections'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Collections ({collections.length})
              </button>
              <button
                onClick={() => setActiveTab('nfts')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'nfts'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                NFTs ({nfts.length})
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="mt-8">
            {activeTab === 'collections' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {collections.map((collection) => (
                  <div key={collection.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                      <SparklesIcon className="h-12 w-12 text-blue-600 opacity-50" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">{collection.name}</h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{collection.description}</p>
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>{collection.itemsCount} items</span>
                        <div className="flex items-center space-x-2">
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
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'nfts' && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {nfts.map((nft) => (
                  <div key={nft.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow group">
                    <div className="aspect-square bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                      <SparklesIcon className="h-8 w-8 text-blue-600 opacity-50" />
                    </div>
                    <div className="p-3">
                      <h4 className="font-medium text-gray-900 text-sm mb-1 truncate">{nft.title}</h4>
                      <p className="text-xs text-gray-500 mb-2">{nft.collection}</p>
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <div className="flex items-center">
                          <EyeIcon className="h-3 w-3 mr-1" />
                          {nft.views}
                        </div>
                        <div className="flex items-center">
                          <HeartIcon className="h-3 w-3 mr-1" />
                          {nft.likes}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {((activeTab === 'collections' && collections.length === 0) || 
              (activeTab === 'nfts' && nfts.length === 0)) && (
              <div className="text-center py-12">
                <SparklesIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No {activeTab} yet</h3>
                <p className="text-gray-600">This designer hasn't created any {activeTab} yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
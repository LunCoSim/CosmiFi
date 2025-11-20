'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowTopRightOnSquareIcon,
  HeartIcon,
  EyeIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

// Mock data for demonstration
const featuredDesigns = [
  {
    id: 1,
    title: "Lunar Rover Module",
    designer: "Alex Chen",
    designerAddress: "0x1234...5678",
    image: "/api/placeholder/400/400",
    likes: 42,
    views: 128,
    collection: "Moon Explorers",
    description: "Modular rover design for lunar surface exploration"
  },
  {
    id: 2,
    title: "Space Station Connector",
    designer: "Sarah Johnson",
    designerAddress: "0xabcd...efgh",
    image: "/api/placeholder/400/400",
    likes: 38,
    views: 95,
    collection: "Orbital Components",
    description: "Universal docking system for space stations"
  },
  {
    id: 3,
    title: "Mars Habitat Unit",
    designer: "Michael Rodriguez",
    designerAddress: "0x9876...5432",
    image: "/api/placeholder/400/400",
    likes: 56,
    views: 203,
    collection: "Red Planet Living",
    description: "Inflatable habitat structure for Mars colonization"
  },
  {
    id: 4,
    title: "Asteroid Mining Drone",
    designer: "Emma Wilson",
    designerAddress: "0xijkl...mnop",
    image: "/api/placeholder/400/400",
    likes: 61,
    views: 187,
    collection: "Space Mining",
    description: "Autonomous drone for asteroid resource extraction"
  },
  {
    id: 5,
    title: "Satellite Deployment System",
    designer: "David Kim",
    designerAddress: "0xqrst...uvwx",
    image: "/api/placeholder/400/400",
    likes: 29,
    views: 112,
    collection: "Launch Solutions",
    description: "Compact satellite deployment mechanism"
  },
  {
    id: 6,
    title: "Zero-G Manufacturing Unit",
    designer: "Lisa Anderson",
    designerAddress: "0yzab...cdef",
    image: "/api/placeholder/400/400",
    likes: 47,
    views: 156,
    collection: "Space Factory",
    description: "3D printing system for zero-gravity environments"
  }
];

export function NFTShowcaseSection() {
  const [likedItems, setLikedItems] = useState<number[]>([]);

  const toggleLike = (id: number) => {
    setLikedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Featured Designs
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl">
              Discover cutting-edge space engineering designs from our community of talented creators
            </p>
          </div>
          <Link 
            href="/collection"
            className="hidden sm:flex items-center text-blue-600 hover:text-blue-700 font-semibold transition-colors"
          >
            View All Collections
            <ArrowTopRightOnSquareIcon className="ml-2 h-5 w-5" />
          </Link>
        </div>

        {/* Mobile Collections Link */}
        <div className="sm:hidden mb-8">
          <Link 
            href="/collection"
            className="flex items-center justify-center w-full text-blue-600 hover:text-blue-700 font-semibold transition-colors bg-white p-3 rounded-lg shadow-sm"
          >
            View All Collections
            <ArrowTopRightOnSquareIcon className="ml-2 h-5 w-5" />
          </Link>
        </div>

        {/* NFT Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredDesigns.map((design) => (
            <div 
              key={design.id} 
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 group"
            >
              {/* NFT Image */}
              <div className="relative aspect-square overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                  <SparklesIcon className="h-16 w-16 text-blue-600 opacity-50" />
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                
                {/* Designer Overlay */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-start opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Link 
                    href={`/designer/${design.designerAddress}`}
                    className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 text-sm font-medium text-gray-900 hover:bg-white transition-colors"
                  >
                    {design.designer}
                  </Link>
                  <button
                    onClick={() => toggleLike(design.id)}
                    className="bg-white/90 backdrop-blur-sm rounded-lg p-2 text-gray-700 hover:bg-white transition-colors"
                  >
                    {likedItems.includes(design.id) ? (
                      <HeartSolidIcon className="h-4 w-4 text-red-500" />
                    ) : (
                      <HeartIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* NFT Content */}
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    <Link href={`/designer/${design.designerAddress}`}>
                      {design.title}
                    </Link>
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">{design.description}</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="font-medium">Collection:</span>
                    <Link 
                      href={`/collection/${design.collection}`}
                      className="ml-2 text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      {design.collection}
                    </Link>
                  </div>
                </div>

                {/* Designer Info */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <Link 
                    href={`/designer/${design.designerAddress}`}
                    className="flex items-center group"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mr-3"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                        {design.designer}
                      </p>
                      <p className="text-xs text-gray-500">{design.designerAddress}</p>
                    </div>
                  </Link>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <EyeIcon className="h-4 w-4 mr-1" />
                      {design.views}
                    </div>
                    <div className="flex items-center">
                      <HeartIcon className="h-4 w-4 mr-1" />
                      {design.likes + (likedItems.includes(design.id) ? 1 : 0)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl sm:text-3xl font-bold mb-4">
              Ready to Showcase Your Designs?
            </h3>
            <p className="text-lg mb-6 max-w-2xl mx-auto opacity-90">
              Join our community of space engineers and start sharing your innovative designs with the world
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/designer">
                <button className="bg-white text-blue-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors">
                  Start Creating
                </button>
              </Link>
              <Link href="/collection">
                <button className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold py-3 px-8 rounded-lg transition-colors">
                  Explore More
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
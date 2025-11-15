import Link from 'next/link';
import {
  ArrowPathIcon,
  CloudArrowUpIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            CosmiFi
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            A decentralized platform for creating, sharing, and evolving space mission designs together
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/designer" 
              className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Get Started
            </Link>
            <Link 
              href="#features" 
              className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>

        <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
              <CloudArrowUpIcon className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Create Blueprints</h3>
            <p className="text-gray-600">
              Upload your engineering designs and mint them as verifiable NFTs on the blockchain
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
              <ArrowPathIcon className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Collaborate</h3>
            <p className="text-gray-600">
              Share, remix, and build on others' work while preserving attribution and value flow
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
              <ShieldCheckIcon className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Own Your Work</h3>
            <p className="text-gray-600">
              Maintain verifiable ownership of your designs with decentralized NFT technology
            </p>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Start Building?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Connect your wallet to begin creating and sharing your engineering designs
          </p>
          <Link 
            href="/designer" 
            className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-8 rounded-lg transition-colors text-lg"
          >
            Launch Designer Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
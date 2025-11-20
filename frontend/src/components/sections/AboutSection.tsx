'use client';

import { 
  CurrencyDollarIcon, 
  ShieldCheckIcon, 
  CubeIcon,
  RocketLaunchIcon,
  CogIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

export function AboutSection() {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Bridging Two Worlds
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Where blockchain technology meets space engineering to create the future of collaborative design
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left Column - Crypto/NFT/Blockchain */}
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 shadow-lg">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-blue-600 rounded-lg mr-4">
                  <CubeIcon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Blockchain Technology</h3>
              </div>
              
              <p className="text-gray-700 mb-6 leading-relaxed">
                Our platform leverages cutting-edge blockchain technology to create a decentralized ecosystem for engineering designs. Every blueprint is minted as a unique NFT, providing verifiable ownership and provenance.
              </p>

              <div className="space-y-4">
                <div className="flex items-start">
                  <CurrencyDollarIcon className="h-6 w-6 text-blue-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">True Digital Ownership</h4>
                    <p className="text-gray-600 text-sm">NFTs provide immutable proof of ownership and authenticity for every design</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <ShieldCheckIcon className="h-6 w-6 text-blue-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Smart Contract Royalties</h4>
                    <p className="text-gray-600 text-sm">Automated royalty distribution ensures creators earn from secondary sales</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <SparklesIcon className="h-6 w-6 text-blue-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Decentralized Governance</h4>
                    <p className="text-gray-600 text-sm">Community-driven platform evolution through transparent voting mechanisms</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Designs/Robots/Space */}
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 shadow-lg">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-purple-600 rounded-lg mr-4">
                  <RocketLaunchIcon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Space-Ready Designs</h3>
              </div>
              
              <p className="text-gray-700 mb-6 leading-relaxed">
                From mechanical components to complete robotic systems, our platform hosts engineering designs specifically crafted for space exploration. These aren't just digital assets - they're blueprints for the future of space technology.
              </p>

              <div className="space-y-4">
                <div className="flex items-start">
                  <CogIcon className="h-6 w-6 text-purple-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Mechanical Components</h4>
                    <p className="text-gray-600 text-sm">Precision-engineered parts designed for extreme space environments</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <RocketLaunchIcon className="h-6 w-6 text-purple-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Robotic Systems</h4>
                    <p className="text-gray-600 text-sm">Complete robotic designs for lunar and Martian exploration missions</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <SparklesIcon className="h-6 w-6 text-purple-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Mission-Ready Blueprints</h4>
                    <p className="text-gray-600 text-sm">Designs vetted for actual space deployment and lunar manufacturing</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA Section */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl sm:text-3xl font-bold mb-4">
              The Future of Collaborative Space Engineering
            </h3>
            <p className="text-lg mb-6 max-w-3xl mx-auto opacity-90">
              Join a global community of engineers, designers, and space enthusiasts building the next generation of space technology together
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors">
                Explore Collections
              </button>
              <button className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold py-3 px-8 rounded-lg transition-colors">
                Become a Designer
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
'use client';

import { BuildingOfficeIcon, RocketLaunchIcon, CogIcon } from '@heroicons/react/24/outline';

export function CompaniesSection() {
  const companies = [
    {
      name: "SpaceTech Industries",
      description: "Leading provider of space exploration technologies and lunar mission equipment",
      icon: RocketLaunchIcon,
      color: "from-blue-500 to-blue-600"
    },
    {
      name: "Blockchain Dynamics",
      description: "Pioneering decentralized solutions for space engineering and NFT infrastructure",
      icon: BuildingOfficeIcon,
      color: "from-purple-500 to-purple-600"
    },
    {
      name: "Cosmic Engineering",
      description: "Advanced mechanical systems and robotics for extraterrestrial environments",
      icon: CogIcon,
      color: "from-indigo-500 to-indigo-600"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Trusted by Industry Leaders
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We partner with pioneering companies at the intersection of space exploration and blockchain technology
          </p>
        </div>

        {/* Companies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {companies.map((company, index) => (
            <div 
              key={company.name}
              className="group relative"
            >
              {/* Company Card */}
              <div className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                {/* Icon */}
                <div className={`inline-flex p-4 bg-gradient-to-br ${company.color} rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <company.icon className="h-8 w-8 text-white" />
                </div>
                
                {/* Company Info */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {company.name}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {company.description}
                </p>
              </div>

              {/* Connecting Lines (Desktop Only) */}
              {index < companies.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-6 transform -translate-y-1/2">
                  <div className="w-12 h-0.5 bg-gradient-to-r from-gray-300 to-transparent"></div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Partnership CTA */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-8 border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Partner With Us
            </h3>
            <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
              Join our ecosystem of innovative companies building the future of space engineering on the blockchain
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors">
                Become a Partner
              </button>
              <button className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 font-semibold py-3 px-8 rounded-lg transition-colors">
                Learn More
              </button>
            </div>
          </div>
        </div>

        {/* Additional Trust Indicators */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">50+</div>
            <div className="text-gray-600">Partner Companies</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">1000+</div>
            <div className="text-gray-600">Designs Created</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">$2M+</div>
            <div className="text-gray-600">Trading Volume</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
            <div className="text-gray-600">Platform Uptime</div>
          </div>
        </div>
      </div>
    </section>
  );
}
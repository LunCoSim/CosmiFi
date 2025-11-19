/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Add this for better performance
  images: {
    domains: ['ipfs.io', 'gateway.pinata.cloud'], // Add your IPFS gateways
  },
  
  webpack: (config, { isServer }) => {
    // Fallbacks for Node.js modules (needed for Web3 libraries)
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      stream: false,
      url: false,
      zlib: false,
      http: false,
      https: false,
      assert: false,
      os: false,
      path: false,
    };
    
    // Exclude wallet libraries from server-side build
    if (isServer) {
      config.externals.push({
        '@walletconnect/ethereum-provider': 'commonjs @walletconnect/ethereum-provider',
        '@walletconnect/universal-provider': 'commonjs @walletconnect/universal-provider',
        'walletconnect': 'commonjs walletconnect',
        'idb-keyval': 'commonjs idb-keyval',
        'lokijs': 'commonjs lokijs',
        'pino-pretty': 'commonjs pino-pretty',
      });
    }
    
    config.resolve.alias = {
      ...config.resolve.alias,
      '@react-native-async-storage/async-storage': false,
    };
    
    // Ignore warnings for optional dependencies
    config.ignoreWarnings = [
      { module: /node_modules\/pino/ },
      { module: /node_modules\/@walletconnect/ },
    ];
    
    return config;
  },
};

module.exports = nextConfig;
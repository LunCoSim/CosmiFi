/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  webpack: (config, { isServer }) => {
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
        '@walletconnect': 'commonjs @walletconnect',
        '@walletconnect/*': 'commonjs @walletconnect/*',
        'walletconnect': 'commonjs walletconnect',
        'idb-keyval': 'commonjs idb-keyval',
      });
    }
    
    config.resolve.alias = {
      ...config.resolve.alias,
      '@react-native-async-storage/async-storage': false,
    };
    
    return config;
  },
};

module.exports = nextConfig;
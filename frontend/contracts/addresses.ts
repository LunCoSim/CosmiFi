// Contract addresses for Base Sepolia testnet
export const CONTRACT_ADDRESSES = {
  REGISTRY: "0x6C4aab39dd9063A7E79FD26caE373bae9efdccb8" as const,
  FACTORY: "0x1700cB6b777b330b870d4Eb9E64025A3bB4F38aE" as const,
  // COLLECTION: Will be dynamically created by factory
} as const;

// Network configuration
export const NETWORK_CONFIG = {
  BASE_SEPOLIA: {
    chainId: 84532,
    name: "Base Sepolia",
    rpcUrls: ["https://sepolia.base.org"],
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
    },
    blockExplorers: {
      default: { name: "BaseScan", url: "https://sepolia.basescan.org" },
    },
  },
} as const;

// Default network
export const DEFAULT_NETWORK = NETWORK_CONFIG.BASE_SEPOLIA;
export const CONTRACT_ADDRESSES = {
  [1]: { // Ethereum Mainnet
    DESIGNER_REGISTRY: '0x...',
    BLUEPRINT_FACTORY: '0x...',
  },
  [8453]: { // Base Mainnet
    DESIGNER_REGISTRY: '0x...',
    BLUEPRINT_FACTORY: '0x...',
  },
  [84532]: { // Base Sepolia Testnet
    DESIGNER_REGISTRY: '0x6C4aab39dd9063A7E79FD26caE373bae9efdccb8',
    BLUEPRINT_FACTORY: '0x1700cB6b777b330b870d4Eb9E64025A3bB4F38aE',
  },
} as const;

export const DEFAULT_CHAIN_ID = 84532; // Base Sepolia for development
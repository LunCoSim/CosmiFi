import { CONTRACT_ADDRESSES } from './addresses';
import DesignerRegistryABI from './abi/DesignerRegistry.json';
import BlueprintFactoryABI from './abi/BlueprintNFTFactory.json';

// Function to get contract addresses based on chain ID
export const getContractAddresses = (chainId: number) => {
  const addresses = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES];
  if (!addresses) {
    // Default to Base Sepolia if chain not supported
    return {
      DESIGNER_REGISTRY: CONTRACT_ADDRESSES[84532].DESIGNER_REGISTRY,
      BLUEPRINT_FACTORY: CONTRACT_ADDRESSES[84532].BLUEPRINT_FACTORY,
    };
  }
  return addresses;
};

// Default contracts for Base Sepolia
export const CONTRACTS = {
  DESIGNER_REGISTRY: {
    address: CONTRACT_ADDRESSES[84532].DESIGNER_REGISTRY,
    abi: DesignerRegistryABI.abi,
  },
  BLUEPRINT_FACTORY: {
    address: CONTRACT_ADDRESSES[84532].BLUEPRINT_FACTORY,
    abi: BlueprintFactoryABI.abi,
  },
} as const;
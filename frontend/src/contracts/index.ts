import { CONTRACT_ADDRESSES } from './addresses';
import DesignerRegistryABI from './abi/DesignerRegistry.json';
import BlueprintFactoryABI from './abi/BlueprintNFTFactory.json';
import BlueprintNFTABI from './abi/BlueprintNFT.json';

// Base Sepolia contracts (only network supported)
export const CONTRACTS = {
  DESIGNER_REGISTRY: {
    address: CONTRACT_ADDRESSES[84532].DESIGNER_REGISTRY,
    abi: DesignerRegistryABI.abi,
  },
  BLUEPRINT_FACTORY: {
    address: CONTRACT_ADDRESSES[84532].BLUEPRINT_FACTORY,
    abi: BlueprintFactoryABI.abi,
  },
  BLUEPRINT_NFT: {
    abi: BlueprintNFTABI,
  },
} as const;

// Function to get contract addresses based on chain ID
export const getContractAddresses = (chainId: number) => {
  // Always return Base Sepolia addresses since it's the only supported network
  return {
    DESIGNER_REGISTRY: CONTRACTS.DESIGNER_REGISTRY.address,
    BLUEPRINT_FACTORY: CONTRACTS.BLUEPRINT_FACTORY.address,
  };
};
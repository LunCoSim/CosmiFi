import { createPublicClient, createWalletClient, http } from 'https://esm.sh/viem@2.21.54'
import { privateKeyToAccount } from 'https://esm.sh/viem@2.21.54/accounts'
import { baseSepolia } from 'https://esm.sh/viem@2.21.54/chains'
import DesignerRegistryABI from '../abi/DesignerRegistry.json' with { type: "json" }
import BlueprintNFTABI from '../abi/BlueprintNFT.json' with { type: "json" }
import BlueprintNFTFactoryABI from '../abi/BlueprintNFTFactory.json' with { type: "json" }

const RPC_URL = Deno.env.get('RPC_BASE_SEPOLIA')
const PRIVATE_KEY = Deno.env.get('PRIVATE_KEY')

if (!RPC_URL) {
  throw new Error('RPC_BASE_SEPOLIA environment variable is not set')
}

if (!PRIVATE_KEY) {
  throw new Error('PRIVATE_KEY environment variable is not set')
}

// Create public client for reading
export const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(RPC_URL)
})

// Create wallet client for writing (transactions)
let walletClient: ReturnType<typeof createWalletClient> | null = null

export function getWalletClient() {
  if (!walletClient) {
    const account = privateKeyToAccount(PRIVATE_KEY as `0x${string}`)
    
    walletClient = createWalletClient({
      account,
      chain: baseSepolia,
      transport: http(RPC_URL)
    })
  }
  
  return walletClient
}

// Contract addresses from environment
export const CONTRACT_ADDRESS = Deno.env.get('CONTRACT_ADDRESS') as `0x${string}` | undefined
export const FACTORY_ADDRESS = Deno.env.get('FACTORY_ADDRESS') as `0x${string}` | undefined
export const REGISTRY_ADDRESS = Deno.env.get('REGISTRY_ADDRESS') as `0x${string}` | undefined

// Validate contract addresses
if (!CONTRACT_ADDRESS || !FACTORY_ADDRESS || !REGISTRY_ADDRESS) {
  console.warn('Warning: Some contract addresses are not set in environment variables')
}

// Contract instances
export const registryContract = {
  address: REGISTRY_ADDRESS as `0x${string}`,
  abi: DesignerRegistryABI,
}

export const factoryContract = {
  address: FACTORY_ADDRESS as `0x${string}`,
  abi: BlueprintNFTFactoryABI,
}

// Helper function to get BlueprintNFT contract instance
export function getBlueprintNFTContract(collectionAddress: string) {
  return {
    address: collectionAddress as `0x${string}`,
    abi: BlueprintNFTABI,
  }
}

// Contract interaction functions
export async function isDesigner(address: string): Promise<boolean> {
  try {
    const result = await publicClient.readContract({
      ...registryContract,
      functionName: 'isDesigner',
      args: [address as `0x${string}`],
    })
    return result as boolean
  } catch (error) {
    console.error('Error checking designer status:', error)
    return false
  }
}

export async function getDesignerCollections(designerAddress: string): Promise<string[]> {
  try {
    const result = await publicClient.readContract({
      ...factoryContract,
      functionName: 'getCollections',
      args: [designerAddress as `0x${string}`],
    })
    return result as string[]
  } catch (error) {
    console.error('Error getting designer collections:', error)
    return []
  }
}

export async function getCollectionDesigner(collectionAddress: string): Promise<string> {
  try {
    const result = await publicClient.readContract({
      ...factoryContract,
      functionName: 'getDesigner',
      args: [collectionAddress as `0x${string}`],
    })
    return result as string
  } catch (error) {
    console.error('Error getting collection designer:', error)
    return ''
  }
}

export async function getDesignData(collectionAddress: string, tokenId: number): Promise<{
  metadataCid: string
  creator: string
  mintedAt: bigint
}> {
  try {
    const contract = getBlueprintNFTContract(collectionAddress)
    const result = await publicClient.readContract({
      ...contract,
      functionName: 'getDesignData',
      args: [BigInt(tokenId)],
    })
    return result as {
      metadataCid: string
      creator: string
      mintedAt: bigint
    }
  } catch (error) {
    console.error('Error getting design data:', error)
    throw error
  }
}

export async function getTokenURI(collectionAddress: string, tokenId: number): Promise<string> {
  try {
    const contract = getBlueprintNFTContract(collectionAddress)
    const result = await publicClient.readContract({
      ...contract,
      functionName: 'tokenURI',
      args: [BigInt(tokenId)],
    })
    return result as string
  } catch (error) {
    console.error('Error getting token URI:', error)
    throw error
  }
}

export async function getTotalSupply(collectionAddress: string): Promise<number> {
  try {
    const contract = getBlueprintNFTContract(collectionAddress)
    const result = await publicClient.readContract({
      ...contract,
      functionName: 'totalSupply',
    })
    return Number(result)
  } catch (error) {
    console.error('Error getting total supply:', error)
    return 0
  }
}

// Signature verification using viem
import { verifyMessage, recoverAddress, hashMessage } from 'https://esm.sh/viem@2.21.54'

export async function verifySignature(
  message: string,
  signature: string,
  address: string
): Promise<boolean> {
  try {
    const messageHash = hashMessage(message)
    const recoveredAddress = await recoverAddress({
      hash: messageHash,
      signature: signature as `0x${string}`,
    })
    return recoveredAddress.toLowerCase() === address.toLowerCase()
  } catch (error) {
    console.error('Error verifying signature:', error)
    return false
  }
}

// Alternative signature verification using viem's verifyMessage
export async function verifyEthSignature(
  message: string,
  signature: string,
  address: string
): Promise<boolean> {
  try {
    const isValid = await verifyMessage({
      address: address as `0x${string}`,
      message,
      signature: signature as `0x${string}`,
    })
    return isValid
  } catch (error) {
    console.error('Error verifying signature:', error)
    return false
  }
}

// Event monitoring functions
export async function getDesignMintedEvents(
  collectionAddress: string,
  fromBlock?: bigint,
  toBlock?: bigint
) {
  try {
    const contract = getBlueprintNFTContract(collectionAddress)
    const events = await publicClient.getContractEvents({
      address: contract.address,
      abi: contract.abi,
      eventName: 'DesignMinted',
      fromBlock,
      toBlock,
    })
    return events
  } catch (error) {
    console.error('Error getting DesignMinted events:', error)
    return []
  }
}

export async function getCollectionCreatedEvents(
  fromBlock?: bigint,
  toBlock?: bigint
) {
  try {
    const events = await publicClient.getContractEvents({
      address: factoryContract.address,
      abi: factoryContract.abi,
      eventName: 'CollectionCreated',
      fromBlock,
      toBlock,
    })
    return events
  } catch (error) {
    console.error('Error getting CollectionCreated events:', error)
    return []
  }
}
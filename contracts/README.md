# Engineering NFT Platform - Smart Contracts

A permissionless NFT platform where designers can create their own collections and mint unique design NFTs. Each designer gets their own collection contract with full minting control.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Smart Contracts](#smart-contracts)
3. [Contract Interactions](#contract-interactions)
4. [Deployment Guide](#deployment-guide)
5. [User Flows](#user-flows)
6. [API Reference](#api-reference)
7. [Security Considerations](#security-considerations)

---

## Architecture Overview

### System Design

```
┌─────────────────────────────────────────────────────────────┐
│                         Platform                             │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐         ┌──────────────────┐          │
│  │ DesignerRegistry │◄────────┤ BlueprintNFT   │          │
│  │  (Tracking)      │         │    Factory       │          │
│  └──────────────────┘         └────────┬─────────┘          │
│                                         │                     │
│                                         │ deploys             │
│                                         ↓                     │
│                          ┌──────────────────────────┐        │
│                          │   BlueprintNFT         │        │
│                          │   Collection #1          │        │
│                          │   (Designer: Alice)      │        │
│                          └──────────────────────────┘        │
│                                         │                     │
│                                         │ deploys             │
│                                         ↓                     │
│                          ┌──────────────────────────┐        │
│                          │   BlueprintNFT         │        │
│                          │   Collection #2          │        │
│                          │   (Designer: Bob)        │        │
│                          └──────────────────────────┘        │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Key Principles

- **Permissionless**: Anyone can become a designer and create collections
- **Autonomous**: Collections are independent after deployment
- **Decentralized**: No ongoing platform control over minting
- **Tracked**: All designers and collections are recorded for discovery

---

## Smart Contracts

### 1. DesignerRegistry.sol

**Purpose**: Tracks all designers who have created collections on the platform.

**Key Features**:
- Permissionless self-registration
- Owner can revoke designers (moderation)
- Simple mapping-based storage
- Event emissions for indexing

**State Variables**:
```solidity
mapping(address => bool) private _isDesigner;  // Designer status
address public owner;                          // Platform owner
```

**Key Functions**:
```solidity
function registerDesigner() external;                    // Self-register
function registerDesignerFor(address designer) external; // Register another address
function revokeDesigner(address designer) external;      // Owner only
function isDesigner(address account) external view returns (bool);
function unregisterDesigner() external;                  // Self-unregister
```

---

### 2. BlueprintNFTFactory.sol

**Purpose**: Deploys per-designer NFT collections and manages designer-collection relationships.

**Key Features**:
- Auto-registers designers on first collection
- Tracks all collections per designer
- Deploys independent BlueprintNFT contracts
- Provides collection discovery

**State Variables**:
```solidity
DesignerRegistry public immutable registry;                    // Registry reference
mapping(address => address[]) private _collectionsByDesigner;  // Designer → Collections
mapping(address => address) public designerOfCollection;       // Collection → Designer
uint256 public totalCollections;                               // Global counter
```

**Key Functions**:
```solidity
function createCollection(string memory name, string memory symbol) 
    external returns (address collection);
    
function getCollections(address designer) 
    external view returns (address[] memory);
    
function getCollectionCount(address designer) 
    external view returns (uint256);
    
function getDesigner(address collection) 
    external view returns (address);
    
function isDesigner(address account) 
    external view returns (bool);
```

---

### 3. BlueprintNFT.sol

**Purpose**: Individual NFT collection contract for a single designer.

**Key Features**:
- Standard ERC721 implementation
- Designer-only minting
- IPFS metadata storage
- Immutable designer address
- Independent operation (no registry dependency)

**State Variables**:
```solidity
address public immutable designer;                      // Minting authority
uint256 public nextTokenId;                            // Auto-increment counter
mapping(uint256 => DesignData) public designs;         // Token metadata

struct DesignData {
    string metadataCid;  // IPFS CID
}
```

**Key Functions**:
```solidity
function mintDesign(address to, string memory metadataCid) 
    public onlyDesigner returns (uint256);
    
function tokenURI(uint256 tokenId) 
    public view override returns (string memory);
    
function totalSupply() public view returns (uint256);

function getDesignData(uint256 tokenId) 
    public view returns (string memory metadataCid, address creator);
    
// Standard ERC721 functions:
function ownerOf(uint256 tokenId) public view returns (address);
function transferFrom(address from, address to, uint256 tokenId) public;
function approve(address to, uint256 tokenId) public;
// ... etc
```

---

## Contract Interactions

### Creation Flow

```
┌─────────┐
│  User   │
└────┬────┘
     │
     │ 1. createCollection("My Art", "ART")
     ↓
┌────────────────┐
│    Factory     │
└────┬───────────┘
     │
     │ 2. Check: isDesigner(user)?
     ↓
┌────────────────┐
│   Registry     │
└────┬───────────┘
     │
     │ 3. Return: false
     ↓
┌────────────────┐
│    Factory     │
└────┬───────────┘
     │
     │ 4. registerDesignerFor(user)
     ↓
┌────────────────┐
│   Registry     │  Sets: _isDesigner[user] = true
└────────────────┘
     │
     │ 5. Returns success
     ↓
┌────────────────┐
│    Factory     │
└────┬───────────┘
     │
     │ 6. new BlueprintNFT("My Art", "ART", user)
     ↓
┌────────────────┐
│ BlueprintNFT │  Deploys at new address
│  Collection    │  designer = user (immutable)
└────────────────┘
     │
     │ 7. Returns collection address
     ↓
┌────────────────┐
│    Factory     │  Tracks: _collectionsByDesigner[user].push(collection)
└────────────────┘
     │
     │ 8. Returns collection address
     ↓
┌─────────┐
│  User   │  Now has a collection at 0xCollection1
└─────────┘
```

### Minting Flow

```
┌─────────┐
│Designer │
└────┬────┘
     │
     │ 1. mintDesign("QmHash...")
     ↓
┌────────────────┐
│ BlueprintNFT │
│   Collection   │
└────┬───────────┘
     │
     │ 2. Check: msg.sender == designer?
     │    ✅ Yes
     │
     │ 3. _safeMint(designer, tokenId)
     │    designs[tokenId] = { metadataCid: "QmHash..." }
     │
     │ 4. Emit DesignMinted(tokenId, designer, "QmHash...")
     ↓
┌─────────┐
│ Designer │  Now owns NFT #tokenId
└─────────┘
```

### Query Flow (Frontend)

```
┌──────────┐
│ Frontend │
└────┬─────┘
     │
     │ 1. Get designer's collections
     │    factory.getCollections(designerAddress)
     ↓
┌────────────────┐
│    Factory     │  Returns: [0xCollection1, 0xCollection2]
└────────────────┘
     │
     │ 2. For each collection, get details
     │    collection.name()
     │    collection.symbol()
     │    collection.totalSupply()
     ↓
┌────────────────┐
│ BlueprintNFT │  Returns: "My Art", "ART", 5
│  Collection    │
└────────────────┘
     │
     │ 3. For each token, get data
     │    collection.ownerOf(tokenId)
     │    collection.tokenURI(tokenId)
     │    collection.getDesignData(tokenId)
     ↓
┌────────────────┐
│ BlueprintNFT │  Returns: 0xBuyer, "ipfs://QmHash...", ("QmHash", 0xDesigner)
│  Collection    │
└────────────────┘
```

---

## Deployment Guide

### Prerequisites

- Solidity ^0.8.13
- Hardhat or Foundry
- OpenZeppelin Contracts ^4.0.0

### Deployment Steps

```javascript
// 1. Deploy Registry
const DesignerRegistry = await ethers.getContractFactory("DesignerRegistry");
const registry = await DesignerRegistry.deploy();
await registry.deployed();
console.log("Registry deployed to:", registry.address);

// 2. Deploy Factory
const BlueprintNFTFactory = await ethers.getContractFactory("BlueprintNFTFactory");
const factory = await BlueprintNFTFactory.deploy(registry.address);
await factory.deployed();
console.log("Factory deployed to:", factory.address);

// 3. Collections are deployed by users via factory.createCollection()
```

### Deployment Order

**CRITICAL**: Deploy in this order:
1. ✅ DesignerRegistry first
2. ✅ BlueprintNFTFactory second (requires registry address)
3. ✅ BlueprintNFT collections (deployed by factory automatically)

### Network Deployment

```javascript
// mainnet-deployment.js
module.exports = {
    networks: {
        mainnet: {
            REGISTRY: "0x...",  // Deploy first, record address
            FACTORY: "0x...",   // Deploy second with registry address
        },
        testnet: {
            REGISTRY: "0x...",
            FACTORY: "0x...",
        }
    }
};
```





## User Flows

### Flow 1: New Designer Creates First Collection

```
1. User connects wallet (MetaMask)
   - Frontend: await provider.send("eth_requestAccounts", [])

2. User clicks "Create Collection"
   - Frontend: Show modal with name/symbol inputs

3. User submits form
   - Frontend: await factory.createCollection(name, symbol)
   - Factory: Checks registry.isDesigner(user) → false
   - Factory: Calls registry.registerDesignerFor(user)
   - Registry: Sets _isDesigner[user] = true ✅
   - Factory: Deploys new BlueprintNFT(name, symbol, user)
   - Factory: Tracks collection in mappings
   - Frontend: Show success + collection address

4. User is now registered + has a collection
   - Can mint NFTs immediately
```

### Flow 2: Designer Mints NFT

```
1. User navigates to "My Collections"
   - Frontend: collections = await factory.getCollections(userAddress)
   - Frontend: Display grid of collections

2. User clicks "Mint NFT" on a collection
   - Frontend: Show mint modal
   - Fields: Recipient address, Metadata CID/Upload

3. Designer uploads image to IPFS
   - Frontend: Upload to Pinata/IPFS
   - Returns: CID (e.g., "QmHash123...")

4. Designer submits mint form
   - Frontend: collection.mintDesign(CID)
   - Collection: Validates designer
   - Collection: Mints token to designer (msg.sender)
   - Frontend: Show success + token ID

5. NFT appears in collection
   - Frontend: Refresh collection view
   - Shows new NFT with designer as owner and creator
```

### Flow 3: Viewing Designer Profile

```
1. User navigates to designer profile page
   - URL: /designer/0xAlice...

2. Frontend loads designer data
   - collections = await factory.getCollections(0xAlice)
   - For each collection:
     * name, symbol, totalSupply
     * All NFTs: ownerOf(id), tokenURI(id), getDesignData(id)

3. Display designer portfolio
   ┌─────────────────────────────────┐
   │ Alice (0xAlice...)              │
   │ 2 Collections · 6 NFTs Created  │
   ├─────────────────────────────────┤
   │ Collection 1: Alice's Art       │
   │ [NFT #1] [NFT #2] [NFT #3]     │
   │                                 │
   │ Collection 2: Alice's Portraits │
   │ [NFT #1] [NFT #2] [NFT #3]     │
   └─────────────────────────────────┘
```

### Flow 4: Buyer Purchases NFT

```
1. Buyer browses designer's collection
   - Sees NFT #5 owned by designer (0xAlice)

2. Buyer makes offer (off-chain or via marketplace)
   - Could use OpenSea, or custom marketplace

3. Designer transfers NFT to recipient
   - Designer: collection.transferFrom(designer, recipient, tokenId)
   - OR Designer lists on marketplace, recipient purchases

4. Recipient receives NFT
   - NFT #5 owner: 0xRecipient ✅
   - Still shows designer as creator via getDesignData()
   - Shows in buyer's wallet (as owner)
```

---

## API Reference

### Factory Contract

#### Read Functions

```solidity
// Get all collections by a designer
function getCollections(address designer) 
    external view returns (address[] memory);

// Get number of collections by a designer
function getCollectionCount(address designer) 
    external view returns (uint256);

// Get designer of a collection
function getDesigner(address collection) 
    external view returns (address);

// Check if address is a registered designer
function isDesigner(address account) 
    external view returns (bool);

// Get total collections on platform
function totalCollections() public view returns (uint256);
```

#### Write Functions

```solidity
// Create a new collection (auto-registers if needed)
function createCollection(string memory name, string memory symbol) 
    external returns (address collection);
```

#### Events

```solidity
event CollectionCreated(
    address indexed designer,
    address indexed collection,
    string name,
    string symbol,
    uint256 collectionId
);
```

---

### Collection Contract (BlueprintNFT)

#### Read Functions

```solidity
// Standard ERC721
function name() external view returns (string memory);
function symbol() external view returns (string memory);
function balanceOf(address owner) external view returns (uint256);
function ownerOf(uint256 tokenId) external view returns (address);
function tokenURI(uint256 tokenId) external view returns (string memory);

// Custom functions
function totalSupply() public view returns (uint256);
function designer() public view returns (address);
function getDesignData(uint256 tokenId) 
    public view returns (string memory metadataCid, address creator);
```

#### Write Functions

```solidity
// Designer only
function mintDesign(address to, string memory metadataCid) 
    public onlyDesigner returns (uint256 tokenId);

// Standard ERC721 transfers (owner only)
function transferFrom(address from, address to, uint256 tokenId) public;
function safeTransferFrom(address from, address to, uint256 tokenId) public;
function approve(address to, uint256 tokenId) public;
function setApprovalForAll(address operator, bool approved) public;
```

#### Events

```solidity
event DesignMinted(
    uint256 indexed tokenId,
    address indexed owner,
    string metadataCid
);

// Standard ERC721 events
event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
event ApprovalForAll(address indexed owner, address indexed operator, bool approved);
```

---

### Registry Contract

#### Read Functions

```solidity
function isDesigner(address account) external view returns (bool);
function owner() public view returns (address);
```

#### Write Functions

```solidity
// Anyone can call
function registerDesigner() external;
function registerDesignerFor(address designer) external;
function unregisterDesigner() external;

// Owner only
function revokeDesigner(address designer) external onlyOwner;
```

#### Events

```solidity
event DesignerRegistered(address indexed designer);
event DesignerRevoked(address indexed designer);
```

---

## Security Considerations

### Access Control

forge create src/BlueprintNFTFactory.sol:BlueprintNFTFactory \
  --rpc-url https://base-sepolia.drpc.org \
  --private-key fff797502a418e1bc326a36216213afd91acdd3f52c2a00f4b52f4c603c187e4 --broadcast\
  --etherscan-api-key YTN7S5J3ST4U5TVE4BGCSW1SKFIW394P2I \
  --constructor-args 0x6C4aab39dd9063A7E79FD26caE373bae9efdccb8 --verify

  forge create src/DesignerRegistry.sol:DesignerRegistry \
  --rpc-url https://base-sepolia.drpc.org \
  --private-key fff797502a418e1bc326a36216213afd91acdd3f52c2a00f4b52f4c603c187e4 \
  --etherscan-api-key YTN7S5J3ST4U5TVE4BGCSW1SKFIW394P2I \
  --verify

**✅ Secure:**
- Only designers can mint in their collections (immutable `designer` address)
- Only owners can transfer their NFTs (standard ERC721)
- Only platform owner can revoke designers

**⚠️ Considerations:**
- Designer address is immutable - cannot be changed after deployment
- Owner revocation only prevents NEW collections, not minting in existing ones
- No multi-sig by default - consider using Gnosis Safe as owner

### Immutability

**Cannot be changed after deployment:**
- Designer address in each collection
- Factory address reference in registry
- Registry address reference in factory

**Can be changed:**
- Designer status in registry (owner can revoke)
- NFT ownership (standard transfers)
- Collection metadata (if metadata is off-chain)

### Known Limitations

1. **No Collection Limit**: Designers can create unlimited collections
   - Could lead to spam/DOS on `getCollections()` queries
   - Consider adding limits or pagination

2. **No Metadata Updates**: Once minted, NFT metadata cannot be updated
   - By design for immutability
   - Consider adding update function if needed

3. **No Royalties**: Standard ERC721 has no royalty enforcement
   - Consider implementing EIP-2981 for royalty support

4. **No Burn Function**: NFTs cannot be destroyed
   - Add if needed for collection management

5. **Gas Costs**: Iterating through large collections is expensive
   - Use events and off-chain indexing for large datasets

### Upgrade Path

Current contracts are **not upgradeable**. To upgrade:

1. Deploy new versions
2. Migrate designer mappings
3. Collections remain on old contracts (immutable)

**Consider**: Using proxy patterns (UUPS, Transparent) for upgradeability

---

## Testing

### Unit Tests

```javascript
describe("BlueprintNFTFactory", function() {
    it("Should auto-register designer on first collection", async function() {
        const [designer] = await ethers.getSigners();
        
        // Designer is not registered initially
        expect(await registry.isDesigner(designer.address)).to.be.false;
        
        // Create collection
        await factory.connect(designer).createCollection("Art", "ART");
        
        // Designer is now registered
        expect(await registry.isDesigner(designer.address)).to.be.true;
    });
    
    it("Should deploy collection with correct designer", async function() {
        const [designer] = await ethers.getSigners();
        
        const tx = await factory.connect(designer).createCollection("Art", "ART");
        const receipt = await tx.wait();
        const event = receipt.events.find(e => e.event === 'CollectionCreated');
        const collectionAddress = event.args.collection;
        
        const collection = await ethers.getContractAt("BlueprintNFT", collectionAddress);
        expect(await collection.designer()).to.equal(designer.address);
    });
});
```

### Integration Tests

```javascript
describe("End-to-End Flow", function() {
    it("Should allow designer to create collection and mint NFT", async function() {
        const [designer, buyer] = await ethers.getSigners();
        
        // 1. Create collection
        const tx = await factory.connect(designer).createCollection("Art", "ART");
        const receipt = await tx.wait();
        const collectionAddress = receipt.events[0].args.collection;
        
        // 2. Mint NFT
        const collection = await ethers.getContractAt("BlueprintNFT", collectionAddress);
        await collection.connect(designer).mintDesign(buyer.address, "QmHash...");
        
        // 3. Verify
        expect(await collection.ownerOf(1)).to.equal(buyer.address);
        expect(await collection.totalSupply()).to.equal(1);
    });
});
```

---

## Troubleshooting

### Common Issues

**Issue**: "designer not registered" error when minting
- **Cause**: Old contract version with registry check in mint
- **Solution**: Redeploy using updated BlueprintNFT contract

**Issue**: Cannot create collection
- **Cause**: Registry not properly set in factory
- **Solution**: Verify factory constructor has correct registry address

**Issue**: Collection not showing in `getCollections()`
- **Cause**: Created before factory tracking was added
- **Solution**: Collections created directly (not via factory) won't appear

**Issue**: High gas costs for collection queries
- **Cause**: Looping through many tokens on-chain
- **Solution**: Use events and off-chain indexing (The Graph)

---

## Future Enhancements

### Potential Features

1. **Royalty Support (EIP-2981)**
   ```solidity
   function royaltyInfo(uint256 tokenId, uint256 salePrice) 
       external view returns (address receiver, uint256 royaltyAmount);
   ```

2. **Metadata Updates**
   ```solidity
   function updateMetadata(uint256 tokenId, string memory newCid) 
       external onlyDesigner;
   ```

3. **Collection Limits**
   ```solidity
   uint256 public constant MAX_COLLECTIONS_PER_DESIGNER = 10;
   ```

4. **Batch Minting**
   ```solidity
   function mintBatch(address[] memory recipients, string[] memory cids) 
       external onlyDesigner;
   ```

5. **Pausable Collections**
   ```solidity
   function pauseCollection() external onlyDesigner;
   function unpauseCollection() external onlyDesigner;
   ```

---

## Support & Resources

- **Documentation**: [Link to full docs]
- **GitHub**: [Repository link]
- **Discord**: [Community link]
- **OpenZeppelin**: https://docs.openzeppelin.com/contracts/
- **EIP-721**: https://eips.ethereum.org/EIPS/eip-721

---

## License

MIT License - See LICENSE file for details

---


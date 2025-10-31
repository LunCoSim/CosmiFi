#  Stage A Prototype

## Modular Engineering NFT Registry on Base + IPFS + Supabase + Vercel

This prototype enables engineers to upload mechanical/CAD designs, auto-generate metadata, pin files to IPFS, and mint provable ownership NFTs on Base.

Designs remain open-modular, supporting future composability (EIP-998 style). This repo implements Stage A: single-component design NFTs (bottom-up path).

---

##  Stage A — Core Capabilities

| Category | Capability |
|----------|------------|
| File Upload | CAD ZIP + preview image → IPFS (Pinata) |
| File Verification | File validation & integrity checks |
| Metadata | JSON auto-generated → IPFS |
| Minting | Single CID stored on-chain |
| Database | Supabase indexing & event sync |
| UI | Upload page → Gallery → Profile |
| Network | Base chain (Base Sepolia for prototype) |

---

##  Architecture

```
┌────────────┐      ┌──────────────┐        ┌──────────┐
│   Frontend │ ---> │ Supabase Edge│ -----> │ Pinata   │
│ Next.js UI │      │  Functions   │        │ (IPFS)   │
└─────┬──────┘      └──────┬───────┘        └─────┬────┘
      │ Upload ZIP/IMG     │ Pin metadata JSON     │
      │ Get CID + file info   │ Return metadata CID   │
      ▼                    ▼                       ▼
┌────────────────────────────────────────────────────────┐
│         User clicks Mint → wallet signs tx            │
└────────────────────────────────────────────────────────┘
                        ▼
                Smart Contract (Base)
                Stores metadata CID only
                        ▼
                 Supabase sync listener
```

---

##  Storage Logic

| Data | Stored Where | Reason |
|------|--------------|--------|
| CAD ZIP |  IPFS | Decentralized artifact storage |
| Preview Image |  IPFS | NFT media |
| Metadata JSON |  IPFS | Canonical metadata |
| Metadata CID |  On-chain | Permanent NFT reference |
| Draft & Indexing |  Supabase | UX & query layer |

---

##  On-chain Data Model

Only metadata CID + creator is stored on chain:

```solidity
struct DesignData {
    string metadataCid;
    address creator;
}

uint256 public nextTokenId;
mapping(uint256 => DesignData) public designs;

event DesignMinted(
    uint256 tokenId,
    address owner,
    string metadataCid
);
```

### Why no previewCid / zipCid on-chain?

-  Metadata JSON already includes references
-  Saves gas
-  Standard NFT metadata flow

---

##  Supabase Schema

```sql
create table profiles (
  wallet text primary key,
  name text,
  bio text,
  avatar_url text
);

create table designs (
  token_id bigint primary key,               
  owner text not null,                       
  metadata_cid text not null,                

  -- extracted from JSON for fast queries
  name text,
  description text,
  category text,
  tags text[],
  version text,
  license text,

  -- file CIDs
  preview_cid text,
  cad_zip_cid text,

  created_at timestamp default now(),
  minted_at timestamp,
  status text default 'draft'  -- draft | uploaded | metadata_ready | minted
);
```

---

##  Upload & Mint UX Flow

```
User selects ZIP + preview
 ↓
Frontend uploads immediately to backend API
 ↓
Backend pins to IPFS + returns:
  - cad_zip_cid
  - preview_cid
 ↓
Frontend stores draft record in Supabase
 ↓
User fills metadata form fields
 ↓
User clicks Mint
 ↓
Backend generates metadata JSON + pins to IPFS
 ↓
Returns metadataCid
 ↓
Frontend calls contract mint(metadataCid)
 ↓
Supabase listener updates record as minted
```

---

##  Metadata JSON Example

```json
{
  "name": "Modular Lander Thruster Module",
  "description": "Thruster subsystem for modular space vehicle",
  "image": "ipfs://bafy..preview.png",
  "cad_zip": "ipfs://bafy..design.zip",
  "creator": "0x1234...abcd",
  "category": "Aerospace",
  "version": "v1.0",
  "tags": ["thruster", "lander", "spacecraft"],
  "license": "CC-BY-4.0",
  "attributes": [
    { "trait_type": "Component Type", "value": "Thruster" },
    { "trait_type": "Format", "value": "SolidWorks" }
  ]
}
```

---

##  Frontend Form Structure

### Design Minting Form

#### Section 1 — Design Information

| Input type | Field |
|------------|-------|
| Text | Design Name |
| Textarea | Description |
| Dropdown | Category |
| Tag input | Tags |
| Text | Version |
| Dropdown | License |
| Text (optional) | Additional Notes |

#### Section 2 — File Upload

| Upload | Accept |
|--------|--------|
| Preview | .png, .jpg, .webp |
| CAD ZIP | .zip |

This form enables users to input all necessary metadata and upload files required to mint a new design NFT. The form validates inputs, uploads files to IPFS, and initiates the minting process upon submission.

---

##  Signup & Profile Flow

### User Authentication & Onboarding

#### 1. User Connects Wallet
The user signs in with their wallet address (EVM signer).

#### 2. Check if Profile Exists
Query Supabase using wallet address as the unique identifier:
- **If profile exists** → Direct user into the dApp
- **If no profile exists** → Continue to onboarding

#### 3. User Creates Profile
User fills a form with:
- Username
- Bio
- Social links
- Portfolio information
- Avatar upload

#### 4. Profile Storage in Supabase
```sql
profiles {
  wallet_address (primary key),
  username,
  bio,
  socials,
  avatar_url,
  created_at
}
```

### Profile-NFT Integration

#### NFT Minting Data Structure
Every NFT minted stores:
- `creator_address`
- `metadata_cid`

#### Frontend Data Retrieval
When the frontend reads NFTs:
1. It fetches profile from Supabase using `creator_address`
2. Fast UI with smoother UX (no slow on-chain lookups)
3. Immediate access to creator information

#### Platform Access
Once profile is created or detected → Designer can use the entire platform:
- Upload CAD files
- Mint NFTs
- Manage designs
- Browse and interact with other designers' work

This flow ensures seamless onboarding while maintaining wallet-native identity and providing fast, efficient user experience through Supabase caching.

---

##  Frontend Data Display & Navigation

### Efficient NFT Gallery with Creator Profiles

With data stored in Supabase, the frontend can display NFTs with creator information efficiently:

- **Fast Gallery Loading**: NFT data is queried from Supabase instead of direct blockchain/IPFS calls, resulting in significantly faster page loads
- **Creator Information Display**: Each NFT in the gallery shows the creator's name, wallet address, and avatar without additional API calls
- **Seamless Profile Navigation**: Clicking on any creator's name/address directs users to their profile page, displaying all their associated designs
- **Connected Data Flow**: The `profiles` and `designs` tables are linked by wallet address, creating a natural relationship between creators and their NFTs


---

##  Env Variables

| Variable | Purpose |
|----------|---------|
| SUPABASE_URL / KEY | Supabase connection |
| PINATA_API_KEY / SECRET | IPFS uploads |
| RPC_BASE_SEPOLIA | Chain RPC |
| NEXT_PUBLIC_CONTRACT_ADDRESS | NFT contract |

---

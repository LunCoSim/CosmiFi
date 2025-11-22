# CosmiFi Backend API Documentation

## Base URL
```
Production: https://your-project.supabase.co/functions/v1
Local: http://localhost:54321/functions/v1
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### POST /auth/verify-wallet
Verify wallet signature and get JWT token.

**Request:**
```json
{
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "signature": "0x...",
  "message": "Login to CosmiFi"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "token": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9...",
    "profile": { ... } | null,
    "isNewUser": true
  }
}
```

---

## Profile Endpoints

### POST /profiles/create-profile
Create or update user profile (upsert).

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "username": "engineer_alice",
  "bio": "Aerospace engineer specializing in satellite design",
  "avatar_url": "QmXx...",
  "banner_url": "QmYy...",
  "website": "https://example.com",
  "email": "alice@example.com",
  "social_links": {
    "twitter": "https://twitter.com/alice",
    "github": "https://github.com/alice"
  }
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "profile": {
      "wallet_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      "username": "engineer_alice",
      "bio": "Aerospace engineer specializing in satellite design",
      "avatar_url": "QmXx...",
      "is_designer": true,
      "created_at": "2025-11-20T22:00:00Z",
      "updated_at": "2025-11-20T22:00:00Z"
    }
  }
}
```

### GET /profiles/get-profile
Get user profile by wallet address.

**Query Parameters:**
- `wallet_address` (required): Wallet address

**Example:**
```
GET /profiles/get-profile?wallet_address=0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "profile": { ... }
  }
}
```

### PUT /profiles/update-profile
Update user profile (authenticated user only).

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "username": "new_username",
  "bio": "Updated bio",
  "avatar_url": "QmNew...",
  "social_links": {
    "twitter": "https://twitter.com/newhandle"
  }
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "profile": { ... }
  }
}
```

### POST /profiles/upload-avatar
Upload avatar or banner image to IPFS.

**Headers:** `Authorization: Bearer <token>`

**Request:** `multipart/form-data`
- `avatar`: File (image/png, image/jpeg, image/webp)
- `type`: "avatar" | "banner" (optional, default: "avatar")

**Example:**
```bash
curl -X POST http://localhost:54321/functions/v1/profiles/upload-avatar \
  -H "Authorization: Bearer TOKEN" \
  -F "avatar=@avatar.png" \
  -F "type=avatar"
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "cid": "QmXx...",
    "url": "https://gateway.pinata.cloud/ipfs/QmXx...",
    "size": 245678,
    "type": "avatar",
    "profile": { ... }
  }
}
```

---

## Design Endpoints

### POST /designs/upload-files
Upload CAD file and preview image to IPFS.

**Headers:** `Authorization: Bearer <token>`

**Request:** `multipart/form-data`
- `cadFile`: File (application/zip)
- `previewFile`: File (image/png, image/jpeg, image/webp)

**Example:**
```bash
curl -X POST http://localhost:54321/functions/v1/designs/upload-files \
  -H "Authorization: Bearer TOKEN" \
  -F "cadFile=@design.zip" \
  -F "previewFile=@preview.png"
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "cadZipCid": "QmAbc...",
    "previewCid": "QmDef...",
    "cadSize": 5242880,
    "previewSize": 245678
  }
}
```

### POST /designs/create-draft
Create a design draft after uploading files.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "name": "Satellite Solar Panel",
  "description": "High-efficiency solar panel for CubeSat applications",
  "category": "Power Systems",
  "tags": ["solar", "power", "cubesat"],
  "version": "v1.0",
  "license": "CC-BY-4.0",
  "previewCid": "QmDef...",
  "cadZipCid": "QmAbc..."
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "design": {
      "id": 1,
      "name": "Satellite Solar Panel",
      "owner_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      "status": "uploaded",
      "preview_cid": "QmDef...",
      "cad_zip_cid": "QmAbc...",
      "created_at": "2025-11-20T22:00:00Z"
    }
  }
}
```

### POST /designs/generate-metadata
Generate NFT metadata and upload to IPFS.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "name": "Satellite Solar Panel",
  "description": "High-efficiency solar panel for CubeSat applications",
  "category": "Power Systems",
  "tags": ["solar", "power", "cubesat"],
  "version": "v1.0",
  "license": "CC-BY-4.0",
  "previewCid": "QmDef...",
  "cadZipCid": "QmAbc..."
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "metadataCid": "QmMeta...",
    "metadata": {
      "name": "Satellite Solar Panel",
      "description": "High-efficiency solar panel for CubeSat applications",
      "image": "ipfs://QmDef...",
      "cad_zip": "ipfs://QmAbc...",
      "creator": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      "category": "Power Systems",
      "version": "v1.0",
      "tags": ["solar", "power", "cubesat"],
      "license": "CC-BY-4.0",
      "attributes": [
        { "trait_type": "Component Type", "value": "Power Systems" },
        { "trait_type": "Format", "value": "CAD" }
      ]
    }
  }
}
```

### GET /designs/get-designs
Get designs with filtering, search, and pagination.

**Query Parameters:**
- `owner`: Filter by owner wallet address
- `status`: Filter by status (draft, uploaded, metadata_ready, minted)
- `category`: Filter by category
- `search`: Search in name and description
- `limit`: Number of results (default: 20, max: 100)
- `offset`: Pagination offset (default: 0)
- `sort_by`: Sort field (default: created_at)
- `sort_order`: asc | desc (default: desc)

**Example:**
```
GET /designs/get-designs?owner=0x742d35...&status=minted&limit=10&offset=0
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "items": [
      {
        "id": 1,
        "name": "Satellite Solar Panel",
        "owner_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
        "status": "minted",
        "token_id": 1,
        "preview_cid": "QmDef...",
        "created_at": "2025-11-20T22:00:00Z"
      }
    ],
    "total": 25,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

### GET /designs/get-design
Get a single design by ID or token ID.

**Query Parameters:**
- `id`: Design database ID
- `token_id`: NFT token ID

**Example:**
```
GET /designs/get-design?id=1
GET /designs/get-design?token_id=1
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "design": {
      "id": 1,
      "token_id": 1,
      "name": "Satellite Solar Panel",
      "description": "High-efficiency solar panel for CubeSat applications",
      "owner_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      "category": "Power Systems",
      "tags": ["solar", "power", "cubesat"],
      "version": "v1.0",
      "license": "CC-BY-4.0",
      "preview_cid": "QmDef...",
      "cad_zip_cid": "QmAbc...",
      "metadata_cid": "QmMeta...",
      "status": "minted",
      "collection_address": "0x...",
      "created_at": "2025-11-20T22:00:00Z",
      "minted_at": "2025-11-20T23:00:00Z"
    }
  }
}
```

### PUT /designs/update-design
Update a design (only drafts and uploaded designs).

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "id": 1,
  "name": "Updated Name",
  "description": "Updated description",
  "category": "New Category",
  "tags": ["new", "tags"],
  "status": "metadata_ready"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "design": { ... }
  }
}
```

**Notes:**
- Only the design owner can update
- Cannot update minted designs
- Status can only be: draft, uploaded, metadata_ready

---

## Webhook Endpoints

### POST /webhook/nft-minted
Handle NFT minting events from blockchain.

**Request:**
```json
{
  "tokenId": 1,
  "owner": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "metadataCid": "QmMeta...",
  "collectionAddress": "0x..."
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "success": true,
    "design": { ... }
  }
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "status": "error",
  "error": "Error message describing what went wrong"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `405` - Method Not Allowed
- `500` - Internal Server Error

---

## Rate Limits

- Authentication: 10 requests per minute per IP
- File uploads: 5 requests per minute per user
- Other endpoints: 60 requests per minute per user

---

## File Size Limits

- Avatar images: 5MB
- Banner images: 10MB
- Preview images: 20MB
- CAD files (ZIP): 100MB
- Metadata JSON: 1MB

---

## IPFS Gateway URLs

All IPFS CIDs can be accessed via:
```
https://gateway.pinata.cloud/ipfs/{CID}
```

Or using IPFS protocol:
```
ipfs://{CID}
```

---

## Example Workflow

### 1. Authenticate
```bash
# Sign message with wallet
MESSAGE="Login to CosmiFi"
SIGNATURE=$(eth-sign "$MESSAGE")

# Get JWT token
curl -X POST http://localhost:54321/functions/v1/auth/verify-wallet \
  -H "Content-Type: application/json" \
  -d "{\"walletAddress\":\"$WALLET\",\"signature\":\"$SIGNATURE\",\"message\":\"$MESSAGE\"}"
```

### 2. Create Profile
```bash
curl -X POST http://localhost:54321/functions/v1/profiles/create-profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","bio":"Engineer"}'
```

### 3. Upload Files
```bash
curl -X POST http://localhost:54321/functions/v1/designs/upload-files \
  -H "Authorization: Bearer $TOKEN" \
  -F "cadFile=@design.zip" \
  -F "previewFile=@preview.png"
```

### 4. Create Draft
```bash
curl -X POST http://localhost:54321/functions/v1/designs/create-draft \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Solar Panel",
    "description":"High-efficiency panel",
    "category":"Power Systems",
    "tags":["solar"],
    "previewCid":"QmDef...",
    "cadZipCid":"QmAbc..."
  }'
```

### 5. Generate Metadata
```bash
curl -X POST http://localhost:54321/functions/v1/designs/generate-metadata \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Solar Panel",
    "description":"High-efficiency panel",
    "category":"Power Systems",
    "tags":["solar"],
    "version":"v1.0",
    "license":"CC-BY-4.0",
    "previewCid":"QmDef...",
    "cadZipCid":"QmAbc..."
  }'
```

### 6. Mint NFT (Frontend)
```javascript
// Use metadata CID to mint on blockchain
const tx = await contract.mintDesign(metadataCid)
await tx.wait()
```

---

## Testing

### Local Development
```bash
# Start Supabase
supabase start

# Serve functions
supabase functions serve --env-file .env

# Test endpoint
curl http://localhost:54321/functions/v1/profiles/get-profile?wallet_address=0x...
```

### Deployment
```bash
# Deploy all functions
supabase functions deploy

# Deploy specific function
supabase functions deploy profiles/get-profile

# Set secrets
supabase secrets set PINATA_API_KEY=your_key
```

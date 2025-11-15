# CosmiFi Backend API Documentation

This document provides comprehensive documentation for all Supabase Edge Functions endpoints in the CosmiFi backend.

## Base URL

```
Production: https://your-project.supabase.co/functions/v1
Development: http://localhost:54321/functions/v1
```

## Authentication

All API endpoints (except wallet verification) require Bearer token authentication:

```http
Authorization: Bearer <jwt_token>
```

## Response Format

All responses follow this standard format:

```json
{
  "data": {}, // Success data
  "error": "error_message", // Error message (if applicable)
  "status": "success|error"
}
```

## Endpoints

### Authentication Endpoints

#### Verify Wallet Signature

Verifies an Ethereum wallet signature and returns a JWT token.

```http
POST /auth/verify-wallet
```

**Request Body:**
```json
{
  "walletAddress": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b",
  "signature": "0x...",
  "message": "Login to CosmiFi at timestamp"
}
```

**Response:**
```json
{
  "data": {
    "token": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9...",
    "profile": {
      "wallet_address": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b",
      "username": "designer123",
      "bio": "Mechanical engineer specializing in aerospace",
      "avatar_url": "https://example.com/avatar.jpg",
      "social_links": {
        "twitter": "@designer123",
        "github": "designer123"
      },
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    },
    "isNewUser": false
  },
  "status": "success"
}
```

### Profile Management Endpoints

#### Create Profile

Creates a new user profile.

```http
POST /profiles/create-profile
```

**Request Body:**
```json
{
  "username": "designer123",
  "bio": "Mechanical engineer specializing in aerospace",
  "avatar_url": "https://example.com/avatar.jpg",
  "social_links": {
    "twitter": "@designer123",
    "github": "designer123",
    "linkedin": "https://linkedin.com/in/designer123"
  }
}
```

**Response:**
```json
{
  "data": {
    "wallet_address": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b",
    "username": "designer123",
    "bio": "Mechanical engineer specializing in aerospace",
    "avatar_url": "https://example.com/avatar.jpg",
    "social_links": {
      "twitter": "@designer123",
      "github": "designer123",
      "linkedin": "https://linkedin.com/in/designer123"
    },
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  },
  "status": "success"
}
```

#### Get Profile

Retrieves a user profile by wallet address.

```http
GET /profiles/get-profile?wallet_address=0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b
```

**Response:**
```json
{
  "data": {
    "wallet_address": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b",
    "username": "designer123",
    "bio": "Mechanical engineer specializing in aerospace",
    "avatar_url": "https://example.com/avatar.jpg",
    "social_links": {
      "twitter": "@designer123",
      "github": "designer123"
    },
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  },
  "status": "success"
}
```

#### Update Profile

Updates an existing user profile.

```http
PUT /profiles/update-profile
```

**Request Body:**
```json
{
  "username": "designer456",
  "bio": "Updated bio",
  "avatar_url": "https://example.com/new-avatar.jpg",
  "social_links": {
    "twitter": "@designer456",
    "website": "https://designer456.com"
  }
}
```

**Response:**
```json
{
  "data": {
    "wallet_address": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b",
    "username": "designer456",
    "bio": "Updated bio",
    "avatar_url": "https://example.com/new-avatar.jpg",
    "social_links": {
      "twitter": "@designer456",
      "website": "https://designer456.com"
    },
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-02T00:00:00Z"
  },
  "status": "success"
}
```

### Design Management Endpoints

#### Upload Files

Uploads CAD files and preview images to IPFS.

```http
POST /designs/upload-files
Content-Type: multipart/form-data
```

**Form Data:**
- `cadFile`: ZIP file containing CAD design (max 50MB)
- `previewFile`: Preview image (PNG/JPG/WebP, max 50MB)

**Response:**
```json
{
  "data": {
    "cadZipCid": "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
    "previewCid": "bafybeihdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
    "cadSize": 1048576,
    "previewSize": 524288
  },
  "status": "success"
}
```

#### Create Draft

Creates a new design draft in the database.

```http
POST /designs/create-draft
```

**Request Body:**
```json
{
  "name": "Modular Lander Thruster Module",
  "description": "Thruster subsystem for modular space vehicle",
  "category": "Aerospace",
  "tags": ["thruster", "lander", "spacecraft"],
  "version": "v1.0",
  "license": "CC-BY-4.0",
  "previewCid": "bafybeihdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
  "cadZipCid": "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi"
}
```

**Response:**
```json
{
  "data": {
    "id": 1,
    "token_id": null,
    "owner_address": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b",
    "metadata_cid": null,
    "name": "Modular Lander Thruster Module",
    "description": "Thruster subsystem for modular space vehicle",
    "category": "Aerospace",
    "tags": ["thruster", "lander", "spacecraft"],
    "version": "v1.0",
    "license": "CC-BY-4.0",
    "preview_cid": "bafybeihdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
    "cad_zip_cid": "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
    "status": "uploaded",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z",
    "minted_at": null
  },
  "status": "success"
}
```

#### Generate Metadata

Generates and pins NFT metadata to IPFS.

```http
POST /designs/generate-metadata
```

**Request Body:**
```json
{
  "name": "Modular Lander Thruster Module",
  "description": "Thruster subsystem for modular space vehicle",
  "category": "Aerospace",
  "tags": ["thruster", "lander", "spacecraft"],
  "version": "v1.0",
  "license": "CC-BY-4.0",
  "previewCid": "bafybeihdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
  "cadZipCid": "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
  "additionalNotes": "Designed for lunar lander applications"
}
```

**Response:**
```json
{
  "data": {
    "metadataCid": "bafybeifjdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
    "metadata": {
      "name": "Modular Lander Thruster Module",
      "description": "Thruster subsystem for modular space vehicle",
      "image": "ipfs://bafybeihdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
      "cad_zip": "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
      "creator": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b",
      "category": "Aerospace",
      "version": "v1.0",
      "tags": ["thruster", "lander", "spacecraft"],
      "license": "CC-BY-4.0",
      "attributes": [
        {
          "trait_type": "Component Type",
          "value": "Aerospace"
        },
        {
          "trait_type": "Format",
          "value": "CAD"
        }
      ]
    }
  },
  "status": "success"
}
```

#### Prepare Mint

Updates design with metadata CID and prepares for minting.

```http
POST /designs/prepare-mint
```

**Request Body:**
```json
{
  "designId": 1,
  "metadataCid": "bafybeifjdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi"
}
```

**Response:**
```json
{
  "data": {
    "id": 1,
    "token_id": null,
    "owner_address": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b",
    "metadata_cid": "bafybeifjdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
    "name": "Modular Lander Thruster Module",
    "description": "Thruster subsystem for modular space vehicle",
    "category": "Aerospace",
    "tags": ["thruster", "lander", "spacecraft"],
    "version": "v1.0",
    "license": "CC-BY-4.0",
    "preview_cid": "bafybeihdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
    "cad_zip_cid": "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
    "status": "metadata_ready",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z",
    "minted_at": null
  },
  "status": "success"
}
```

#### Get Designs

Retrieves designs with optional filtering.

```http
GET /designs/get-designs?category=Aerospace&status=minted&limit=10&offset=0
```

**Query Parameters:**
- `category` (optional): Filter by category
- `status` (optional): Filter by status (draft, uploaded, metadata_ready, minted)
- `owner_address` (optional): Filter by owner wallet address
- `limit` (optional): Number of results to return (default: 20)
- `offset` (optional): Number of results to skip (default: 0)

**Response:**
```json
{
  "data": {
    "designs": [
      {
        "id": 1,
        "token_id": 1,
        "owner_address": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b",
        "metadata_cid": "bafybeifjdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
        "name": "Modular Lander Thruster Module",
        "description": "Thruster subsystem for modular space vehicle",
        "category": "Aerospace",
        "tags": ["thruster", "lander", "spacecraft"],
        "version": "v1.0",
        "license": "CC-BY-4.0",
        "preview_cid": "bafybeihdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
        "cad_zip_cid": "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
        "status": "minted",
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z",
        "minted_at": "2024-01-01T01:00:00Z"
      }
    ],
    "total": 1,
    "limit": 10,
    "offset": 0
  },
  "status": "success"
}
```

### Webhook Endpoints

#### NFT Minted

Webhook endpoint to handle NFT minting events from the blockchain.

```http
POST /webhook/nft-minted
```

**Request Body:**
```json
{
  "tokenId": 1,
  "owner": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b",
  "metadataCid": "bafybeifjdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
  "transactionHash": "0x...",
  "blockNumber": 12345678
}
```

**Response:**
```json
{
  "data": {
    "success": true,
    "design": {
      "id": 1,
      "token_id": 1,
      "owner_address": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b",
      "metadata_cid": "bafybeifjdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
      "status": "minted",
      "minted_at": "2024-01-01T01:00:00Z"
    }
  },
  "status": "success"
}
```

## Error Responses

### Authentication Errors

```json
{
  "error": "Missing or invalid token",
  "status": "error"
}
```

### Validation Errors

```json
{
  "error": "Both CAD and preview files required",
  "status": "error"
}
```

### File Upload Errors

```json
{
  "error": "CAD file must be a ZIP archive",
  "status": "error"
}
```

```json
{
  "error": "Files must be smaller than 50MB",
  "status": "error"
}
```

### IPFS Errors

```json
{
  "error": "IPFS upload failed: File too large",
  "status": "error"
}
```

### Database Errors

```json
{
  "error": "Design not found",
  "status": "error"
}
```

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- Authentication endpoints: 5 requests per minute
- File upload endpoints: 10 requests per minute
- Other endpoints: 100 requests per minute

## SDK Examples

### JavaScript/TypeScript

```typescript
// Authentication
const authResponse = await fetch('/auth/verify-wallet', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    walletAddress,
    signature,
    message
  })
})
const { token } = await authResponse.json()

// File Upload
const formData = new FormData()
formData.append('cadFile', cadFile)
formData.append('previewFile', previewFile)

const uploadResponse = await fetch('/designs/upload-files', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
})
const { cadZipCid, previewCid } = await uploadResponse.json()
```

### Python

```python
import requests

# Authentication
auth_response = requests.post('/auth/verify-wallet', json={
    'walletAddress': wallet_address,
    'signature': signature,
    'message': message
})
token = auth_response.json()['data']['token']

# Get Designs
headers = {'Authorization': f'Bearer {token}'}
designs_response = requests.get('/designs/get-designs', headers=headers)
designs = designs_response.json()['data']['designs']
```

This API documentation provides comprehensive coverage of all backend endpoints for the CosmiFi platform, making it easy for frontend developers to integrate with the Supabase Edge Functions backend.
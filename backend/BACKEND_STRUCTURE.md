# Backend Structure Documentation

This document provides an overview of the backend folder structure and explains the purpose of each folder and file.

## Root Level Files

### `.env`
- **Purpose**: Environment variables configuration
- **Contains**: Database URLs, API keys, JWT secrets, blockchain RPC URLs, and contract addresses
- **Important**: Should not be committed to version control (contains sensitive data)

### `deno.jsonc`
- **Purpose**: Deno runtime configuration file
- **Contains**: Compiler options, task definitions, and permissions for Deno runtime

### `import_map.json`
- **Purpose**: Maps module names to URLs for Deno imports
- **Contains**: External library mappings (viem, supabase, etc.)
- **Note**: Ensures consistent versions across the project

### `package.json`
- **Purpose**: Node.js package configuration
- **Contains**: Dependencies and scripts for the backend
- **Used**: For development tools and local testing

### `tsconfig.json`
- **Purpose**: TypeScript compiler configuration
- **Contains**: Type checking options and path mappings

### `run-dev.sh`
- **Purpose**: Development server startup script
- **Contains**: Commands to run the backend in development mode

### `README.md`
- **Purpose**: Backend documentation and setup instructions
- **Contains**: Installation guide, API documentation, and usage examples

### Documentation Files
- `backend-api-documentation.md`: Detailed API endpoint documentation
- `backend-implementation-guide.md`: Implementation guidelines and best practices
- `backend-implementation-roadmap.md`: Development roadmap and milestones
- `backend-integration-summary.md`: Summary of backend integrations
- `backend-supabase-integration-plan.md`: Supabase integration strategy
- `installation-guide.md`: Step-by-step installation instructions
- `supabase.md`: Supabase-specific configuration and setup

## `supabase/` Directory

### `config.toml`
- **Purpose**: Supabase CLI configuration
- **Contains**: Project ID, API URLs, and database connection settings

### `migrations/` Directory
- **Purpose**: Database schema migrations
- **Contains**: SQL files for database structure changes
- **Example**: `20240101000001_initial_schema.sql` - Initial database schema

### `functions/` Directory
This is the main directory for serverless functions that handle API endpoints.

#### `_shared/` Directory
Contains shared utilities, types, and middleware used across multiple functions.

##### `abi/` Subdirectory
- **DesignerRegistry.json**: ABI for the DesignerRegistry smart contract
- **BlueprintNFT.json**: ABI for the BlueprintNFT smart contract
- **BlueprintNFTFactory.json**: ABI for the BlueprintNFTFactory smart contract

##### `middleware/` Subdirectory
- **auth.ts**: Authentication middleware for protecting routes
- **Purpose**: Validates JWT tokens and handles user authentication

##### `types/` Subdirectory
- **index.ts**: TypeScript type definitions used across functions
- **Contains**: User types, design types, API request/response types

##### `utils/` Subdirectory
- **contracts.ts**: Blockchain interaction utilities
  - **Purpose**: Smart contract interaction functions
  - **Contains**: Viem clients, contract instances, and read/write functions
- **ipfs.ts**: IPFS integration utilities
  - **Purpose**: Pinata integration for file storage
  - **Contains**: Upload and retrieval functions for IPFS
- **jwt.ts**: JWT token utilities
  - **Purpose**: Token creation and validation
  - **Contains**: Signing and verification functions
- **validation.ts**: Input validation utilities
  - **Purpose**: Request data validation
  - **Contains**: Schema validation functions

#### `auth/` Directory
Authentication-related functions.

##### `verify-wallet/` Subdirectory
- **index.ts**: Wallet verification endpoint
- **Purpose**: Verifies Ethereum wallet ownership via signature
- **Method**: POST - Validates wallet signature and returns JWT

#### `designs/` Directory
Design management functions.

##### `generate-metadata/` Subdirectory
- **index.ts**: Metadata generation endpoint
- **Purpose**: Generates NFT metadata for designs
- **Method**: POST - Creates metadata JSON for NFT minting

##### `upload-files/` Subdirectory
- **index.ts**: File upload endpoint
- **Purpose**: Uploads design files to IPFS
- **Method**: POST - Handles file uploads and returns IPFS hashes

#### `profiles/` Directory
User profile management functions.

##### `create-profile/` Subdirectory
- **index.ts**: Profile creation endpoint
- **Purpose**: Creates or updates user profiles
- **Method**: POST - Saves user profile data to database

#### `webhook/` Directory
Webhook handlers for external events.

##### `nft-minted/` Subdirectory
- **index.ts**: NFT minting webhook handler
- **Purpose**: Processes NFT minting events from blockchain
- **Method**: POST - Handles webhook notifications

## Function Flow

1. **Authentication Flow**:
   - Client calls `/auth/verify-wallet` with signature
   - Middleware validates signature
   - JWT token is returned for subsequent requests

2. **Design Creation Flow**:
   - Client uploads files via `/designs/upload-files`
   - Files are stored on IPFS via Pinata
   - Client generates metadata via `/designs/generate-metadata`
   - Metadata is stored for NFT minting

3. **Profile Management Flow**:
   - Authenticated user calls `/profiles/create-profile`
   - Profile data is validated and stored in Supabase
   - Profile is linked to wallet address

4. **Webhook Flow**:
   - Blockchain events trigger `/webhook/nft-minted`
   - Event data is processed and stored
   - Database is updated with minting information

## Key Technologies

- **Runtime**: Deno (secure JavaScript/TypeScript runtime)
- **Database**: Supabase (PostgreSQL with real-time features)
- **Blockchain**: Viem (Ethereum interaction library)
- **Storage**: IPFS via Pinata (decentralized file storage)
- **Authentication**: JWT tokens with signature verification

## Security Considerations

1. **Environment Variables**: All sensitive data stored in `.env`
2. **Input Validation**: All inputs validated using schemas
3. **Authentication**: JWT tokens with expiration
4. **Rate Limiting**: Should be implemented for production
5. **CORS**: Configured for frontend integration

## Development Notes

1. **Local Development**: Use `run-dev.sh` to start development server
2. **Testing**: Each function can be tested independently
3. **Deployment**: Functions deploy to Supabase Edge Runtime
4. **Monitoring**: Supabase provides built-in monitoring tools
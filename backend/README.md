# CosmiFi Backend

This directory contains the Supabase Edge Functions backend for the CosmiFi engineering NFT platform.

## Architecture

The backend is built using Supabase Edge Functions with the following key components:

- **Authentication Layer**: JWT-based authentication using Ethereum wallet signatures
- **Storage Layer**: IPFS integration via Pinata service
- **Database Layer**: Supabase PostgreSQL with Row Level Security (RLS)
- **API Layer**: Edge Functions providing RESTful endpoints for all operations

## Directory Structure

```
backend/
├── supabase/
│   ├── functions/
│   │   ├── _shared/
│   │   │   ├── middleware/
│   │   │   │   └── auth.ts
│   │   │   ├── utils/
│   │   │   │   ├── ipfs.ts
│   │   │   │   ├── jwt.ts
│   │   │   │   └── validation.ts
│   │   │   └── types/
│   │   │       └── index.ts
│   │   ├── auth/
│   │   │   ├── verify-wallet.ts
│   │   │   └── register-designer.ts
│   │   ├── profiles/
│   │   │   ├── create-profile.ts
│   │   │   ├── get-profile.ts
│   │   │   └── update-profile.ts
│   │   ├── designs/
│   │   │   ├── upload-files.ts
│   │   │   ├── create-draft.ts
│   │   │   ├── generate-metadata.ts
│   │   │   ├── prepare-mint.ts
│   │   │   └── get-designs.ts
│   │   └── webhook/
│   │       └── nft-minted.ts
│   ├── migrations/
│   │   └── *.sql
│   └── config.toml
├── package.json
├── tsconfig.json
├── deno.json
├── import_map.json
├── .env
└── README.md
```

## Setup Instructions

### 1. Install Dependencies

```bash
# Install npm packages
npm install

# Install Supabase CLI (if not already installed)
npm install -g supabase
```

### 2. Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_ANON_KEY=your_supabase_anon_key

# Pinata Configuration
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_at_least_32_characters_long

# Blockchain Configuration
RPC_BASE_SEPOLIA=your_base_sepolia_rpc_url
CONTRACT_ADDRESS=your_deployed_contract_address
FACTORY_ADDRESS=your_deployed_factory_address
REGISTRY_ADDRESS=your_deployed_registry_address
```

### 3. Initialize Supabase

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_ID

# Start local development
supabase start
```

### 4. Database Setup

Apply the database schema:

```bash
# Apply migrations
supabase db push
```

### 5. Deploy Functions

```bash
# Deploy all functions
supabase functions deploy

# Deploy specific function
supabase functions deploy auth/verify-wallet

# Set secrets
supabase secrets set PINATA_API_KEY=your_key
supabase secrets set PINATA_SECRET_KEY=your_secret
supabase secrets set JWT_SECRET=your_jwt_secret
```

## API Endpoints

### Authentication

- `POST /auth/verify-wallet` - Verify wallet signature and generate JWT

### Profile Management

- `POST /profiles/create-profile` - Create new user profile
- `GET /profiles/get-profile` - Retrieve user profile
- `PUT /profiles/update-profile` - Update user profile

### Design Management

- `POST /designs/upload-files` - Upload CAD files and preview images
- `POST /designs/create-draft` - Create design draft
- `POST /designs/generate-metadata` - Generate NFT metadata
- `POST /designs/prepare-mint` - Prepare design for minting
- `GET /designs/get-designs` - Retrieve designs with filtering

### Webhooks

- `POST /webhook/nft-minted` - Handle NFT minting events

## Development

### Local Development

```bash
# Start Supabase services
supabase start

# Serve functions locally
supabase functions serve --env-file .env

# Run tests
deno test --allow-net
```

### Testing

```bash
# Test individual functions
curl -X POST http://localhost:54321/functions/v1/auth/verify-wallet \
  -H "Content-Type: application/json" \
  -d '{"walletAddress":"0x1234...","signature":"0x...","message":"Login to CosmiFi"}'

# Test file upload
curl -X POST http://localhost:54321/functions/v1/designs/upload-files \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "cadFile=@path/to/cad.zip" \
  -F "previewFile=@path/to/preview.png"
```

## Security Considerations

1. **Authentication**: JWT tokens with 24-hour expiration
2. **Authorization**: Row Level Security (RLS) policies in Supabase
3. **Input Validation**: File type and size validation
4. **Rate Limiting**: API endpoint rate limiting
5. **Secure Headers**: Proper CORS and security headers

## Performance Optimizations

1. **File Compression**: Automatic compression for uploaded files
2. **CDN Integration**: IPFS content delivery optimization
3. **Database Indexing**: Optimized queries for design retrieval
4. **Caching Strategy**: Response caching for frequently accessed data
5. **Connection Pooling**: Efficient database connection management

## Troubleshooting

### Common Issues

1. **Docker not starting**
   - Ensure Docker Desktop is running
   - Check if port 54321 is available

2. **Supabase functions not deploying**
   - Check your authentication: `supabase login`
   - Verify project linking: `supabase status`
   - Check function syntax with `deno check`

3. **IPFS upload failures**
   - Verify Pinata API keys
   - Check file size limits (50MB)
   - Ensure proper file formats

4. **Database connection errors**
   - Verify Supabase URL and keys
   - Check RLS policies
   - Ensure database is running: `supabase status`

## Contributing

1. Follow the existing code style
2. Add tests for new functions
3. Update documentation
4. Ensure all environment variables are documented

## License

MIT License - See LICENSE file for details
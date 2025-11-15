# CosmiFi Backend Installation Guide
    
This guide covers all the tools and dependencies you need to install for a smooth implementation of the CosmiFi backend.

## Prerequisites

### System Requirements
- **Operating System**: Windows 10+, macOS 10.15+, or Linux (Ubuntu 18.04+)
- **Memory**: At least 8GB RAM (16GB recommended)
- **Storage**: At least 10GB free disk space
- **Network**: Stable internet connection for downloads and deployments

## Required Tools

### 1. Node.js and npm
**Purpose**: JavaScript runtime and package manager for development tools

**Installation**:
```bash
# Using nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# Or download directly from https://nodejs.org (LTS version)
```

**Verification**:
```bash
node --version  # Should be v18.x.x or higher
npm --version   # Should be 9.x.x or higher
```

### 2. Supabase CLI
**Purpose**: Local development and deployment of Supabase Edge Functions

**Installation**:
```bash
# Using npm
npm install -g supabase

# Or using yarn
yarn global add supabase

# Or using Homebrew (macOS)
brew install supabase/tap/supabase
```

**Verification**:
```bash
supabase --version  # Should be 1.x.x or higher
```

### 3. Docker Desktop
**Purpose**: Container runtime for local Supabase development

**Installation**:
- **Windows/Mac**: Download from https://www.docker.com/products/docker-desktop
- **Linux**: Follow instructions at https://docs.docker.com/engine/install/

**Verification**:
```bash
docker --version  # Should be 20.x.x or higher
docker-compose --version  # Should be 2.x.x or higher
```

### 4. Git
**Purpose**: Version control for the project

**Installation**:
- **Windows**: Download from https://git-scm.com/download/win
- **Mac**: `brew install git`
- **Linux**: `sudo apt-get install git` (Ubuntu/Debian)

**Verification**:
```bash
git --version  # Should be 2.x.x or higher
```

### 5. VS Code (Recommended)
**Purpose**: Code editor with excellent TypeScript and Deno support

**Installation**:
- Download from https://code.visualstudio.com/

**Recommended Extensions**:
- Deno (denoland.vscode-deno)
- TypeScript Importer (pmneo.tsimporter)
- Prettier (esbenp.prettier-vscode)
- GitLens (eamodio.gitlens)

## Service Accounts

### 1. Supabase Account
**Purpose**: Backend-as-a-Service platform

**Setup**:
1. Go to https://supabase.com
2. Sign up for a new account
3. Create a new project
4. Note your project URL and anon key

### 2. Pinata Account
**Purpose**: IPFS pinning service for file storage

**Setup**:
1. Go to https://pinata.cloud
2. Sign up for a free account
3. Generate API keys (API Key and Secret Key)
4. Save these keys for environment variables

### 3. Alchemy/Infura Account
**Purpose**: Ethereum RPC provider for Base network

**Setup**:
1. Go to https://www.alchemy.com or https://infura.io
2. Sign up for a free account
3. Create a new API key for Base Sepolia testnet
4. Save the RPC URL for environment variables

## Project Setup

### 1. Clone Repository
```bash
git clone https://github.com/your-org/cosmifi.git
cd cosmifi
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your credentials
nano .env
```

### 3. Initialize Supabase
```bash
# Login to Supabase CLI
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_ID

# Start local development
supabase start
```

### 4. Deploy Edge Functions
```bash
# Deploy all functions
supabase functions deploy

# Or deploy specific function
supabase functions deploy designs/upload-files

# Set secrets
supabase secrets set PINATA_API_KEY=your_key
supabase secrets set PINATA_SECRET_KEY=your_secret
supabase secrets set JWT_SECRET=your_jwt_secret
```

## Environment Variables

Create a `.env` file in the backend directory:

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

## Development Workflow

### 1. Local Development
```bash
# Start Supabase services
supabase start

# Serve Edge Functions locally
supabase functions serve --env-file .env

# In another terminal, run tests
deno test --allow-net
```

### 2. Testing
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

### 3. Deployment
```bash
# Deploy to production
supabase functions deploy

# Check deployment status
supabase functions list
```

## Optional Tools

### 1. Postman
**Purpose**: API testing and documentation
- Download from https://www.postman.com/

### 2. TablePlus (or similar)
**Purpose**: Database management
- Download from https://tableplus.com/

### 3. MetaMask
**Purpose**: Browser wallet for testing
- Install from https://metamask.io/

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

### Performance Tips

1. **Local Development**
   - Use SSD for better Docker performance
   - Allocate sufficient RAM to Docker (4GB+)
   - Use local Supabase for faster development

2. **Function Optimization**
   - Implement proper error handling
   - Use connection pooling for database
   - Cache frequently accessed data

## Security Best Practices

1. **Environment Variables**
   - Never commit `.env` files
   - Use strong, unique secrets
   - Rotate keys regularly

2. **API Security**
   - Implement rate limiting
   - Validate all inputs
   - Use HTTPS in production

3. **File Uploads**
   - Scan uploaded files for malware
   - Implement file type validation
   - Set reasonable size limits

## Next Steps

1. **Complete Installation**
   - Install all required tools
   - Set up service accounts
   - Configure environment variables

2. **Local Testing**
   - Start local Supabase
   - Deploy functions locally
   - Test all endpoints

3. **Production Deployment**
   - Deploy functions to Supabase
   - Set up monitoring
   - Configure webhooks

This installation guide provides everything you need for a smooth implementation of the CosmiFi backend. Following these steps will ensure you have all the necessary tools and configurations in place.
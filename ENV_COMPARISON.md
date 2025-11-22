# Environment Variables Comparison & Setup Guide

## Backend `.env` (Current - Reference)

The backend `.env` should contain:

```env
# Supabase Configuration
SUPABASE_URL=https://uomudtgpbbvirvvcjmzr.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your_service_role_key>
SUPABASE_ANON_KEY=<your_anon_key>

# Pinata Configuration (IPFS)
PINATA_API_KEY=<your_pinata_api_key>
PINATA_SECRET_KEY=<your_pinata_secret_key>
PINATA_JWT=<your_pinata_jwt_token>

# JWT Configuration
JWT_SECRET=<your_jwt_secret_32_chars_minimum>

# Blockchain Configuration
PRIVATE_KEY=<optional_for_backend_transactions>
RPC_BASE_SEPOLIA=https://sepolia.base.org
CONTRACT_ADDRESS=<your_blueprint_nft_contract>
FACTORY_ADDRESS=0x1700cB6b777b330b870d4Eb9E64025A3bB4F38aE
REGISTRY_ADDRESS=0x6C4aab39dd9063A7E79FD26caE373bae9efdccb8
```

---

## Frontend `.env.local` (Should Match)

The frontend `.env.local` should contain:

```env
# Supabase Configuration (PUBLIC - safe to expose)
NEXT_PUBLIC_SUPABASE_URL=https://uomudtgpbbvirvvcjmzr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<same_as_backend_SUPABASE_ANON_KEY>

# API Configuration (PUBLIC)
NEXT_PUBLIC_API_URL=https://uomudtgpbbvirvvcjmzr.supabase.co/functions/v1

# Blockchain Configuration (PUBLIC)
NEXT_PUBLIC_RPC_BASE_SEPOLIA=https://sepolia.base.org
NEXT_PUBLIC_FACTORY_ADDRESS=0x1700cB6b777b330b870d4Eb9E64025A3bB4F38aE
NEXT_PUBLIC_REGISTRY_ADDRESS=0x6C4aab39dd9063A7E79FD26caE373bae9efdccb8
NEXT_PUBLIC_CONTRACT_ADDRESS=<your_blueprint_nft_contract>

# Optional: Pinata Gateway for displaying IPFS content (PUBLIC)
NEXT_PUBLIC_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/

# Optional: Chain ID
NEXT_PUBLIC_CHAIN_ID=84532
```

---

## Key Differences

### Backend `.env`
- Contains **SECRET** keys (SERVICE_ROLE_KEY, PINATA_SECRET_KEY, JWT_SECRET, PRIVATE_KEY)
- Used by Edge Functions running on Supabase servers
- **NEVER** exposed to the client

### Frontend `.env.local`
- Contains **PUBLIC** keys only (prefixed with `NEXT_PUBLIC_`)
- Used by Next.js frontend running in the browser
- Safe to expose to clients
- Uses ANON_KEY (not SERVICE_ROLE_KEY)

---

## Critical Values to Match

| Variable | Backend | Frontend | Notes |
|----------|---------|----------|-------|
| Supabase URL | `SUPABASE_URL` | `NEXT_PUBLIC_SUPABASE_URL` | Must be identical |
| Anon Key | `SUPABASE_ANON_KEY` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Must be identical |
| RPC URL | `RPC_BASE_SEPOLIA` | `NEXT_PUBLIC_RPC_BASE_SEPOLIA` | Must be identical |
| Factory Address | `FACTORY_ADDRESS` | `NEXT_PUBLIC_FACTORY_ADDRESS` | Must be identical |
| Registry Address | `REGISTRY_ADDRESS` | `NEXT_PUBLIC_REGISTRY_ADDRESS` | Must be identical |
| Contract Address | `CONTRACT_ADDRESS` | `NEXT_PUBLIC_CONTRACT_ADDRESS` | Must be identical |

---

## Step-by-Step: Update Frontend `.env.local`

### 1. Get Values from Supabase Dashboard

Go to: https://supabase.com/dashboard/project/uomudtgpbbvirvvcjmzr/settings/api

Copy:
- **Project URL** → Use for `NEXT_PUBLIC_SUPABASE_URL`
- **anon public** key → Use for `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. Update Frontend `.env.local`

```bash
cd /home/godbrand/Documents/GitHub/CosmiFi/frontend
```

Edit `.env.local` to include:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://uomudtgpbbvirvvcjmzr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<paste_anon_key_from_dashboard>

# API
NEXT_PUBLIC_API_URL=https://uomudtgpbbvirvvcjmzr.supabase.co/functions/v1

# Blockchain
NEXT_PUBLIC_RPC_BASE_SEPOLIA=https://sepolia.base.org
NEXT_PUBLIC_FACTORY_ADDRESS=0x1700cB6b777b330b870d4Eb9E64025A3bB4F38aE
NEXT_PUBLIC_REGISTRY_ADDRESS=0x6C4aab39dd9063A7E79FD26caE373bae9efdccb8
NEXT_PUBLIC_CONTRACT_ADDRESS=<your_deployed_contract_address>

# IPFS
NEXT_PUBLIC_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/

# Chain
NEXT_PUBLIC_CHAIN_ID=84532
```

### 3. Verify Contract Addresses Match

Make sure the contract addresses in both files are the same:
- `FACTORY_ADDRESS` (backend) = `NEXT_PUBLIC_FACTORY_ADDRESS` (frontend)
- `REGISTRY_ADDRESS` (backend) = `NEXT_PUBLIC_REGISTRY_ADDRESS` (frontend)
- `CONTRACT_ADDRESS` (backend) = `NEXT_PUBLIC_CONTRACT_ADDRESS` (frontend)

---

## Security Checklist

### ✅ Safe to Expose (Frontend)
- Supabase URL
- Supabase ANON key
- RPC URLs
- Contract addresses
- IPFS gateway URL
- Chain ID

### ❌ NEVER Expose (Backend Only)
- `SUPABASE_SERVICE_ROLE_KEY` - Full database access
- `PINATA_SECRET_KEY` - Can delete/modify IPFS pins
- `JWT_SECRET` - Can forge authentication tokens
- `PRIVATE_KEY` - Can sign transactions

---

## Testing the Configuration

### Test Backend
```bash
cd backend
supabase secrets list
# Verify all secrets are set
```

### Test Frontend
```bash
cd frontend
npm run dev
# Open browser console and check:
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log(process.env.NEXT_PUBLIC_API_URL)
```

### Test API Connection
```bash
# From frontend, test API call
curl "https://uomudtgpbbvirvvcjmzr.supabase.co/functions/v1/designs-get-designs?limit=5"
```

---

## Common Issues

### Issue: "Invalid API key"
**Solution**: Check that `NEXT_PUBLIC_SUPABASE_ANON_KEY` matches the anon key from Supabase dashboard

### Issue: "CORS error"
**Solution**: Verify `NEXT_PUBLIC_API_URL` is correct and includes `/functions/v1`

### Issue: "Contract not found"
**Solution**: Verify contract addresses match between backend and frontend

### Issue: "Environment variables not loading"
**Solution**: 
1. Restart Next.js dev server after changing `.env.local`
2. Clear `.next` cache: `rm -rf .next`
3. Rebuild: `npm run dev`

---

## Quick Copy-Paste Template

**Frontend `.env.local` Template**:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://uomudtgpbbvirvvcjmzr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# API
NEXT_PUBLIC_API_URL=https://uomudtgpbbvirvvcjmzr.supabase.co/functions/v1

# Blockchain
NEXT_PUBLIC_RPC_BASE_SEPOLIA=https://sepolia.base.org
NEXT_PUBLIC_FACTORY_ADDRESS=0x1700cB6b777b330b870d4Eb9E64025A3bB4F38aE
NEXT_PUBLIC_REGISTRY_ADDRESS=0x6C4aab39dd9063A7E79FD26caE373bae9efdccb8
NEXT_PUBLIC_CONTRACT_ADDRESS=

# IPFS
NEXT_PUBLIC_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/

# Chain
NEXT_PUBLIC_CHAIN_ID=84532
```

**Fill in**:
1. `NEXT_PUBLIC_SUPABASE_ANON_KEY` - From Supabase dashboard
2. `NEXT_PUBLIC_CONTRACT_ADDRESS` - Your deployed BlueprintNFT contract

---

## Verification Checklist

- [ ] Frontend has `NEXT_PUBLIC_SUPABASE_URL` set
- [ ] Frontend has `NEXT_PUBLIC_SUPABASE_ANON_KEY` set
- [ ] Frontend has `NEXT_PUBLIC_API_URL` set to Edge Functions URL
- [ ] Contract addresses match between backend and frontend
- [ ] RPC URL matches between backend and frontend
- [ ] No secret keys in frontend `.env.local`
- [ ] All frontend env vars prefixed with `NEXT_PUBLIC_`
- [ ] Dev server restarted after env changes

---

## Next Steps

1. **Update frontend `.env.local`** with the template above
2. **Get anon key** from Supabase dashboard
3. **Restart Next.js** dev server
4. **Test API calls** from frontend
5. **Verify wallet connection** works with correct chain ID

Your backend is fully deployed and ready - just need to sync the frontend environment variables!

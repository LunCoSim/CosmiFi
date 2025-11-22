# Environment Variables Setup

This document describes the environment variables needed for the CosmiFi application.

## Frontend Environment Variables

Create a `.env.local` file in the `frontend` directory with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Blockchain Configuration (existing)
NEXT_PUBLIC_CHAIN_ID=84532
NEXT_PUBLIC_RPC_URL=https://sepolia.base.org
NEXT_PUBLIC_DESIGNER_REGISTRY_ADDRESS=0x...
NEXT_PUBLIC_BLUEPRINT_FACTORY_ADDRESS=0x...

# Dynamic Wallet Configuration (existing)
NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID=your-dynamic-env-id
```

### Getting Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy the **Project URL** (use for `NEXT_PUBLIC_SUPABASE_URL`)
4. Copy the **anon/public** key (use for `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

## Backend Environment Variables

The backend `.env` file should already be configured with:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
SUPABASE_ANON_KEY=your-anon-key-here

# IPFS/Pinata Configuration
PINATA_API_KEY=your-pinata-api-key
PINATA_SECRET_KEY=your-pinata-secret-key

# Blockchain RPC
RPC_URL=https://sepolia.base.org
```

### Getting Pinata Credentials

1. Sign up at [pinata.cloud](https://pinata.cloud)
2. Go to **API Keys** in your dashboard
3. Create a new API key with pinning permissions
4. Copy the API Key and Secret

## Security Notes

> [!CAUTION]
> **Never commit `.env` or `.env.local` files to version control!**

- The `.env.local` file is already in `.gitignore`
- Never share your service role key publicly
- The anon key is safe to use in the frontend (it's public)
- Use Row Level Security (RLS) policies to protect your data

## Verification

To verify your environment variables are set correctly:

### Frontend
```bash
cd frontend
npm run dev
```

Check the browser console for any Supabase connection warnings.

### Backend
```bash
cd backend
supabase functions serve
```

Test an endpoint:
```bash
curl http://localhost:54321/functions/v1/profiles/get-profile?wallet_address=0x123...
```

## Troubleshooting

### "Supabase environment variables not configured" warning

This means `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` is missing from your `.env.local` file.

### API calls failing with CORS errors

Make sure your Supabase project has the correct CORS settings. The backend edge functions already include CORS headers.

### Authentication errors

Ensure you're signing messages with your wallet before making authenticated requests. The `useAuth` hook handles this automatically.

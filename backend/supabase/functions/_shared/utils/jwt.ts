import { create, verify } from 'https://deno.land/x/djwt@v2.8/mod.ts'
import { JWTPayload } from '../types/index.ts'

const JWT_SECRET = Deno.env.get('JWT_SECRET')

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set')
}

if (JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters long')
}

let cryptoKey: CryptoKey | null = null

async function getCryptoKey(): Promise<CryptoKey> {
  if (cryptoKey) return cryptoKey
  
  try {
    const encoder = new TextEncoder()
    const keyData = encoder.encode(JWT_SECRET)
    cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-512' },
      true,
      ['sign', 'verify']
    )
    return cryptoKey
  } catch (error) {
    throw new Error(`Failed to create crypto key: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function generateJWT(payload: { wallet_address: string; user_id?: string; role?: string }): Promise<string> {
  const key = await getCryptoKey()
  const now = Math.floor(Date.now() / 1000)
  
  const jwtPayload: JWTPayload = {
    ...payload,
    iat: now,
    exp: now + 24 * 60 * 60
  }
  
  return await create({ alg: 'HS512', typ: 'JWT' }, jwtPayload, key)
}

export async function verifyJWT(token: string): Promise<JWTPayload> {
  const key = await getCryptoKey()
  try {
    const payload = await verify(token, key)
    
    // Validate required custom fields
    if (!payload.wallet_address || typeof payload.wallet_address !== 'string') {
      throw new Error('Invalid token: missing wallet_address')
    }
    
    return payload as JWTPayload
  } catch (error) {
    throw new Error(`Invalid JWT token: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export function extractWalletFromToken(token: string): string {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    if (!payload.wallet_address) {
      throw new Error('No wallet address in token')
    }
    return payload.wallet_address
  } catch (error) {
    throw new Error('Failed to extract wallet address from token')
  }
}
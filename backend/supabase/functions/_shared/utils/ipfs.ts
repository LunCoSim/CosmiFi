import { PinataResponse } from '../types/index.ts'

const PINATA_API_KEY = Deno.env.get('PINATA_API_KEY')!
const PINATA_SECRET_KEY = Deno.env.get('PINATA_SECRET_KEY')!

export async function pinFileToIPFS(
  file: File, 
  name?: string,
  retries = 3
): Promise<PinataResponse> {
  for (let i = 0; i < retries; i++) {
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      if (name) {
        const options = JSON.stringify({
          pinataMetadata: { name }
        })
        formData.append('pinataOptions', options)
      }
      
      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS' as string, {
        method: 'POST',
        headers: {
          'pinata_api_key': PINATA_API_KEY,
          'pinata_secret_api_key': PINATA_SECRET_KEY
        },
        body: formData
      })
      
      if (!response.ok) {
        const error = await response.text()
        throw new Error(`IPFS upload failed: ${error}`)
      }
      
      return response.json()
    } catch (error) {
      if (i === retries - 1) throw error
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)))
    }
  }
  throw new Error('Failed to upload to IPFS after retries')
}

export async function pinJSONToIPFS(
  json: any, 
  name?: string,
  retries = 3
): Promise<PinataResponse> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS' as string, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'pinata_api_key': PINATA_API_KEY,
          'pinata_secret_api_key': PINATA_SECRET_KEY
        },
        body: JSON.stringify({
          pinataContent: json,
          pinataMetadata: name ? { name } : undefined
        })
      })
      
      if (!response.ok) {
        const error = await response.text()
        throw new Error(`IPFS JSON upload failed: ${error}`)
      }
      
      return response.json()
    } catch (error) {
      if (i === retries - 1) throw error
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)))
    }
  }
  throw new Error('Failed to upload JSON to IPFS after retries')
}

export function createIPFSUrl(cid: string): string {
  return `ipfs://${cid}`
}

export function createIPFSGatewayUrl(cid: string): string {
  return `https://gateway.pinata.cloud/ipfs/${cid}`
}

export function validateFile(file: File, allowedTypes: string[], maxSize: number): void {
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`File type ${file.type} is not allowed`)
  }
  
  if (file.size > maxSize) {
    throw new Error(`File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`)
  }
}

export async function getFileHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}

// Verify that a CID is pinned
export async function verifyPin(cid: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://api.pinata.cloud/data/pinList?hashContains=${cid}`,
      {
        headers: {
          'pinata_api_key': PINATA_API_KEY,
          'pinata_secret_api_key': PINATA_SECRET_KEY
        }
      }
    )
    
    if (!response.ok) return false
    
    const data = await response.json()
    return data.count > 0
  } catch (error) {
    console.error('Error verifying pin:', error)
    return false
  }
}

// Unpin a file from IPFS (for cleanup)
export async function unpinFromIPFS(cid: string): Promise<void> {
  const response = await fetch(
    `https://api.pinata.cloud/pinning/unpin/${cid}`,
    {
      method: 'DELETE',
      headers: {
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_KEY
      }
    }
  )
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to unpin: ${error}`)
  }
}

// Retrieve metadata from IPFS
export async function getIPFSMetadata(cid: string): Promise<any> {
  const response = await fetch(createIPFSGatewayUrl(cid))
  
  if (!response.ok) {
    throw new Error(`Failed to fetch IPFS content: ${response.statusText}`)
  }
  
  return response.json()
}

// Detect file type from file extension and MIME type
export function detectFileType(file: File): string {
  const ext = file.name.split('.').pop()?.toLowerCase()
  const mimeType = file.type
  
  // CAD file extensions
  if (['step', 'stp', 'iges', 'igs', 'stl', 'obj', 'fbx', 'dae'].includes(ext || '')) {
    return 'cad'
  }
  
  // Image types
  if (mimeType.startsWith('image/')) return 'image'
  
  // Archive types
  if (mimeType === 'application/zip' || ext === 'zip') return 'archive'
  
  // JSON
  if (mimeType === 'application/json' || ext === 'json') return 'json'
  
  return 'unknown'
}

// File size limits for different types
export const FILE_SIZE_LIMITS = {
  avatar: 5 * 1024 * 1024,      // 5MB
  banner: 10 * 1024 * 1024,     // 10MB
  preview: 20 * 1024 * 1024,    // 20MB
  cad: 100 * 1024 * 1024,       // 100MB
  metadata: 1 * 1024 * 1024     // 1MB
}
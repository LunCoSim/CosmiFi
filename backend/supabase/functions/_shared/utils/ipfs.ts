import { PinataResponse } from '../types/index.ts'

const PINATA_API_KEY = Deno.env.get('PINATA_API_KEY')!
const PINATA_SECRET_KEY = Deno.env.get('PINATA_SECRET_KEY')!

export async function pinFileToIPFS(file: File, name?: string): Promise<PinataResponse> {
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
}

export async function pinJSONToIPFS(json: any, name?: string): Promise<PinataResponse> {
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
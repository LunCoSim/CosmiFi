export function validateWalletAddress(address: string): boolean {
  // Basic Ethereum address validation
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

export function validateSignature(signature: string): boolean {
  // Basic signature format validation
  return /^0x[a-fA-F0-9]{130}$/.test(signature)
}

export function validateMessage(message: string): boolean {
  // Basic message validation
  return Boolean(message && message.length > 0 && message.length <= 200)
}

export function sanitizeInput(input: any): any {
  if (typeof input !== 'object' || input === null) {
    return input
  }
  
  const sanitized: any = {}
  for (const key in input) {
    if (typeof input[key] === 'string') {
      sanitized[key] = input[key].trim()
    } else if (Array.isArray(input[key])) {
      sanitized[key] = input[key].map(item => 
        typeof item === 'string' ? item.trim() : item
      )
    } else {
      sanitized[key] = input[key]
    }
  }
  
  return sanitized
}

export function validateDesignData(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!data.name || data.name.trim().length === 0) {
    errors.push('Design name is required')
  }
  
  if (!data.description || data.description.trim().length === 0) {
    errors.push('Description is required')
  }
  
  if (!data.category || data.category.trim().length === 0) {
    errors.push('Category is required')
  }
  
  if (!data.previewCid || data.previewCid.trim().length === 0) {
    errors.push('Preview CID is required')
  }
  
  if (!data.cadZipCid || data.cadZipCid.trim().length === 0) {
    errors.push('CAD ZIP CID is required')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}
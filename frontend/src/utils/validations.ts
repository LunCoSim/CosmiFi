import { z } from 'zod';

export const designerRegistrationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
  bio: z.string().min(10, 'Bio must be at least 10 characters').max(500, 'Bio must be less than 500 characters'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  twitter: z.string().min(2, 'Twitter handle must be at least 2 characters').optional().or(z.literal('')),
});

export const createCollectionSchema = z.object({
  name: z.string().min(2, 'Collection name must be at least 2 characters').max(100, 'Collection name must be less than 100 characters'),
  symbol: z.string().min(2, 'Symbol must be at least 2 characters').max(10, 'Symbol must be less than 10 characters').regex(/^[A-Z]+$/, 'Symbol must be uppercase letters only'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description must be less than 1000 characters'),
});

export const mintNFTSchema = z.object({
  name: z.string().min(2, 'NFT name must be at least 2 characters').max(100, 'NFT name must be less than 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description must be less than 1000 characters'),
  category: z.string().min(1, 'Please select a category'),
  tags: z.array(z.string()).min(1, 'Please add at least one tag'),
  license: z.string().min(1, 'Please select a license'),
});

export type DesignerRegistrationForm = z.infer<typeof designerRegistrationSchema>;
export type CreateCollectionForm = z.infer<typeof createCollectionSchema>;
export type MintNFTForm = z.infer<typeof mintNFTSchema>;
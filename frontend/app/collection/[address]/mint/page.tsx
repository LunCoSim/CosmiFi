'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACTS } from '../../../../src/contracts';
import { Address } from 'viem';
import { Button } from '../../../../src/components/ui/Button';
import { PageLoading } from '../../../../src/components/ui/Loading';
import { useForm } from 'react-hook-form';

interface Collection {
  name: string;
  symbol: string;
  designer: Address;
}

interface DesignFormData {
  name: string;
  description: string;
  category: string;
  tags: string[];
  version: string;
  license: string;
  previewFile: File | null;
  cadZipFile: File | null;
  previewCid: string;
  cadZipCid: string;
  metadataCid: string;
}

const CATEGORIES = [
  'Aerospace',
  'Automotive',
  'Consumer Products',
  'Electronics',
  'Industrial',
  'Medical',
  'Robotics',
  'Structural',
  'Other'
];

const LICENSES = [
  'CC-BY-4.0',
  'CC-BY-SA-4.0',
  'CC-BY-NC-4.0',
  'MIT',
  'Apache-2.0',
  'GPL-3.0',
  'Proprietary'
];

export default function MintNFTPage() {
  const params = useParams();
  const router = useRouter();
  const collectionAddress = params.address as Address;
  const { address, isConnected } = useAccount();
  
  const [collection, setCollection] = useState<Collection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMinting, setIsMinting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: Design Info, 2: File Upload, 3: Review & Mint
  
  // Form data
  const [formData, setFormData] = useState<DesignFormData>({
    name: '',
    description: '',
    category: CATEGORIES[0],
    tags: [],
    version: 'v1.0',
    license: 'CC-BY-4.0',
    previewFile: null,
    cadZipFile: null,
    previewCid: '',
    cadZipCid: '',
    metadataCid: ''
  });
  
  const [tagInput, setTagInput] = useState('');
  const [uploadProgress, setUploadProgress] = useState({ preview: 0, cadZip: 0 });
  const [isUploading, setIsUploading] = useState(false);
  
  // Contract write hooks
  const { writeContract, data: hash, error: writeError, isPending } = useWriteContract();
  
  // Wait for transaction confirmation
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    console.log('Mint page loaded for collection:', collectionAddress);
    console.log('Wallet connected:', isConnected);
    console.log('Wallet address:', address);
  }, [collectionAddress, isConnected, address]);

  // Add logging to track wallet state during navigation
  useEffect(() => {
    console.log('Mint page: Wallet state changed');
    console.log('- isConnected:', isConnected);
    console.log('- address:', address);
    console.log('- collectionAddress:', collectionAddress);
  }, [isConnected, address, collectionAddress]);

  // Read collection details from contract
  const { data: name } = useReadContract({
    address: collectionAddress,
    abi: CONTRACTS.BLUEPRINT_NFT?.abi,
    functionName: 'name',
    query: {
      enabled: !!collectionAddress,
      staleTime: 5 * 60 * 1000, // 5 minutes cache
    }
  });

  const { data: symbol } = useReadContract({
    address: collectionAddress,
    abi: CONTRACTS.BLUEPRINT_NFT?.abi,
    functionName: 'symbol',
    query: {
      enabled: !!collectionAddress,
      staleTime: 5 * 60 * 1000, // 5 minutes cache
    }
  });

  const { data: designer } = useReadContract({
    address: collectionAddress,
    abi: CONTRACTS.BLUEPRINT_NFT?.abi,
    functionName: 'designer',
    query: {
      enabled: !!collectionAddress,
      staleTime: 5 * 60 * 1000, // 5 minutes cache
    }
  });

  useEffect(() => {
    if (name && symbol && designer) {
      setCollection({
        name: name as string,
        symbol: symbol as string,
        designer: designer as Address,
      });
      setIsLoading(false);
    }
  }, [name, symbol, designer]);

  // Initialize React Hook Form
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<DesignFormData>({
    defaultValues: formData
  });

  // Update form data when hook form values change
  useEffect(() => {
    const subscription = watch((value) => {
      setFormData(prev => ({
        ...prev,
        ...value,
        tags: (value.tags || []).filter((tag): tag is string => tag !== undefined)
      }));
    });
    return () => subscription.unsubscribe();
  }, [watch, setFormData]);

  // Handle tag input
  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (newTag && !formData.tags.includes(newTag)) {
        setValue('tags', [...formData.tags, newTag]);
        setTagInput('');
      }
    }
  };

  // Remove tag
  const removeTag = (tagToRemove: string) => {
    setValue('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'preview' | 'cadZip') => {
    const file = e.target.files?.[0];
    if (file) {
      setValue(fileType === 'preview' ? 'previewFile' : 'cadZipFile', file);
    }
  };

  // Upload files to IPFS via backend
  const uploadFiles = async () => {
    if (!formData.previewFile || !formData.cadZipFile) {
      alert('Please select both preview and CAD ZIP files');
      return;
    }

    setIsUploading(true);
    setUploadProgress({ preview: 0, cadZip: 0 });

    try {
      // Upload preview file
      const previewFormData = new FormData();
      previewFormData.append('file', formData.previewFile);
      
      const previewResponse = await fetch('/api/upload', {
        method: 'POST',
        body: previewFormData,
      });
      
      if (!previewResponse.ok) throw new Error('Failed to upload preview file');
      const previewResult = await previewResponse.json();
      setUploadProgress(prev => ({ ...prev, preview: 100 }));
      
      // Upload CAD ZIP file
      const cadFormData = new FormData();
      cadFormData.append('file', formData.cadZipFile);
      
      const cadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: cadFormData,
      });
      
      if (!cadResponse.ok) throw new Error('Failed to upload CAD ZIP file');
      const cadResult = await cadResponse.json();
      setUploadProgress(prev => ({ ...prev, cadZip: 100 }));

      // Update form data with CIDs
      setFormData(prev => ({
        ...prev,
        previewCid: previewResult.cid,
        cadZipCid: cadResult.cid
      }));

      // Move to next step
      setCurrentStep(3);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload files. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Generate metadata and mint
  const onMintSubmit = async (data: DesignFormData) => {
    try {
      setIsMinting(true);
      
      // Generate metadata
      const metadata = {
        name: data.name,
        description: data.description,
        image: `ipfs://${data.previewCid}`,
        cad_zip: `ipfs://${data.cadZipCid}`,
        creator: address,
        category: data.category,
        version: data.version,
        tags: data.tags,
        license: data.license,
        attributes: [
          { trait_type: "Component Type", value: data.category },
          { trait_type: "Version", value: data.version },
          { trait_type: "License", value: data.license }
        ]
      };

      // Upload metadata to IPFS
      const metadataResponse = await fetch('/api/metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metadata),
      });

      if (!metadataResponse.ok) throw new Error('Failed to upload metadata');
      const metadataResult = await metadataResponse.json();
      
      // Store design in Supabase
      const designResponse = await fetch('/api/designs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          category: data.category,
          tags: data.tags,
          version: data.version,
          license: data.license,
          preview_cid: data.previewCid,
          cad_zip_cid: data.cadZipCid,
          metadata_cid: metadataResult.cid,
          owner_address: address,
          status: 'metadata_ready'
        }),
      });

      if (!designResponse.ok) throw new Error('Failed to save design');
      
      // Mint NFT
      writeContract({
        address: collectionAddress,
        abi: CONTRACTS.BLUEPRINT_NFT?.abi,
        functionName: 'mintDesign',
        args: [metadataResult.cid],
      });
    } catch (error) {
      console.error('Error minting NFT:', error);
      alert('Error minting NFT. Please try again.');
      setIsMinting(false);
    }
  };

  // Reset minting state when transaction is confirmed
  useEffect(() => {
    if (isConfirmed) {
      setIsMinting(false);
      alert('NFT minted successfully!');
      // Navigate back to collection page
      router.push(`/collection/${collectionAddress}`);
    }
  }, [isConfirmed, router, collectionAddress]);

  // Cleanup form on unmount
  useEffect(() => {
    return () => {
      // Cleanup any subscriptions or timers if needed
    };
  }, []);

  // Handle write errors
  useEffect(() => {
    if (writeError) {
      console.error('Write error:', writeError);
      alert(`Error: ${writeError.message}`);
      setIsMinting(false);
    }
  }, [writeError]);

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h1>
          <p className="text-gray-600 mb-6">Please connect your wallet to mint NFTs</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <PageLoading text="Loading collection details..." />;
  }

  if (!collection) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Collection Not Found</h1>
          <p className="text-gray-600">The collection you're trying to mint to doesn't exist</p>
        </div>
      </div>
    );
  }

  const isOwner = address === collection.designer;

  if (!isOwner) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">Only the collection owner can mint new NFTs</p>
          <Button onClick={() => router.push(`/collection/${collectionAddress}`)}>
            Back to Collection
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="py-6">
            <nav className="flex mb-4" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-4">
                <li>
                  <button
                    onClick={() => router.push('/designer')}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Dashboard
                  </button>
                </li>
                <li>
                  <div className="flex items-center">
                    <svg
                      className="flex-shrink-0 h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <button
                      onClick={() => router.push(`/collection/${collectionAddress}`)}
                      className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700"
                    >
                      {collection.name}
                    </button>
                  </div>
                </li>
                <li>
                  <div className="flex items-center">
                    <svg
                      className="flex-shrink-0 h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="ml-4 text-sm font-medium text-gray-500">
                      Mint NFT
                    </span>
                  </div>
                </li>
              </ol>
            </nav>
            
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Mint New NFT</h1>
                <p className="text-gray-600">{collection.name}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className={`flex items-center ${currentStep >= 1 ? 'text-primary-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>
                  1
                </div>
                <span className="ml-2 font-medium">Design Information</span>
              </div>
              <div className={`flex items-center ${currentStep >= 2 ? 'text-primary-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>
                  2
                </div>
                <span className="ml-2 font-medium">File Upload</span>
              </div>
              <div className={`flex items-center ${currentStep >= 3 ? 'text-primary-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>
                  3
                </div>
                <span className="ml-2 font-medium">Review & Mint</span>
              </div>
            </div>
          </div>

          {/* Step 1: Design Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Design Information</h2>
              
              <form onSubmit={handleSubmit(onMintSubmit)}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Design Name *
                    </label>
                    <input
                      {...register('name', { required: true })}
                      type="text"
                      id="name"
                      placeholder="Enter design name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-black"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      {...register('category', { required: true })}
                      id="category"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-black"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      {...register('description', { required: true })}
                      id="description"
                      placeholder="Describe your design, its purpose, and key features"
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-black"
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="version" className="block text-sm font-medium text-gray-700 mb-2">
                      Version
                    </label>
                    <input
                      {...register('version')}
                      type="text"
                      id="version"
                      placeholder="v1.0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-black"
                    />
                    {errors.version && (
                      <p className="mt-1 text-sm text-red-600">{errors.version.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="license" className="block text-sm font-medium text-gray-700 mb-2">
                      License
                    </label>
                    <select
                      {...register('license')}
                      id="license"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-black"
                    >
                      {LICENSES.map(license => (
                        <option key={license} value={license}>{license}</option>
                      ))}
                    </select>
                    {errors.license && (
                      <p className="mt-1 text-sm text-red-600">{errors.license.message}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                      Tags
                    </label>
                    <input
                      type="text"
                      id="tags"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagInput}
                      placeholder="Add tags (press Enter or comma to add)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-black"
                    />
                    <div className="mt-2 flex flex-wrap gap-2">
                      {formData.tags.map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-2 text-primary-600 hover:text-primary-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </form>

              <div className="flex justify-end">
                <Button
                  onClick={() => setCurrentStep(2)}
                  disabled={!formData.name || !formData.description}
                >
                  Next: Upload Files
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: File Upload */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Upload Design Files</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="preview" className="block text-sm font-medium text-gray-700 mb-2">
                    Preview Image *
                  </label>
                  <input
                    {...register('previewFile', { required: true })}
                    type="file"
                    id="preview"
                    accept=".png,.jpg,.jpeg,.webp"
                    onChange={(e) => handleFileSelect(e, 'preview')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-black"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    PNG, JPG, or WebP format. Recommended size: 800x600px
                  </p>
                  {formData.previewFile && (
                    <p className="mt-2 text-sm text-green-600">
                      Selected: {formData.previewFile.name}
                    </p>
                  )}
                  {errors.previewFile && (
                    <p className="mt-1 text-sm text-red-600">{errors.previewFile.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="cadZip" className="block text-sm font-medium text-gray-700 mb-2">
                    CAD Design Files *
                  </label>
                  <input
                    {...register('cadZipFile', { required: true })}
                    type="file"
                    id="cadZip"
                    accept=".zip"
                    onChange={(e) => handleFileSelect(e, 'cadZip')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-black"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    ZIP file containing all CAD files and documentation
                  </p>
                  {formData.cadZipFile && (
                    <p className="mt-2 text-sm text-green-600">
                      Selected: {formData.cadZipFile.name}
                    </p>
                  )}
                  {errors.cadZipFile && (
                    <p className="mt-1 text-sm text-red-600">{errors.cadZipFile.message}</p>
                  )}
                </div>
              </div>

              {isUploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Preview Image</span>
                    <span className="text-sm text-gray-600">{uploadProgress.preview}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress.preview}%` }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">CAD ZIP</span>
                    <span className="text-sm text-gray-600">{uploadProgress.cadZip}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress.cadZip}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <Button
                  onClick={() => setCurrentStep(1)}
                  variant="outline"
                  disabled={isUploading}
                >
                  Back
                </Button>
                <Button
                  onClick={uploadFiles}
                  disabled={!formData.previewFile || !formData.cadZipFile || isUploading}
                >
                  {isUploading ? 'Uploading...' : 'Upload Files'}
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Review & Mint */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Review & Mint</h2>
              
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Design Summary</h3>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Name</dt>
                    <dd className="mt-1 text-sm text-gray-900">{formData.name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Category</dt>
                    <dd className="mt-1 text-sm text-gray-900">{formData.category}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Version</dt>
                    <dd className="mt-1 text-sm text-gray-900">{formData.version}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">License</dt>
                    <dd className="mt-1 text-sm text-gray-900">{formData.license}</dd>
                  </div>
                  <div className="md:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Description</dt>
                    <dd className="mt-1 text-sm text-gray-900">{formData.description}</dd>
                  </div>
                  <div className="md:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Tags</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {formData.tags.length > 0 ? formData.tags.join(', ') : 'None'}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <h3 className="text-sm font-medium text-yellow-800 mb-2">Before you mint:</h3>
                <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                  <li>Review all information carefully</li>
                  <li>Ensure all files are uploaded correctly</li>
                  <li>Make sure you have enough gas for transaction</li>
                  <li>This action is irreversible once confirmed on-chain</li>
                </ul>
              </div>

              <div className="flex justify-between">
                <Button
                  onClick={() => setCurrentStep(2)}
                  variant="outline"
                  disabled={isMinting || isConfirming}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={isMinting || isConfirming}
                  className="flex items-center space-x-2"
                >
                  {isMinting || isConfirming ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>{isConfirming ? 'Confirming...' : 'Minting...'}</span>
                    </>
                  ) : (
                    <span>Mint NFT</span>
                  )}
                </Button>
              </div>

              {hash && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-800">
                    Transaction submitted! Hash:
                    <a
                      href={`https://sepolia.basescan.org/tx/${hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-1 underline hover:text-green-900"
                    >
                      {hash}
                    </a>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

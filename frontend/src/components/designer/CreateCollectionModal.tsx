'use client';

import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { createCollectionSchema, CreateCollectionForm } from '../../utils/validations';
import { useCollection } from '../../hooks/useCollection';
import { useSingleTransaction } from '../../hooks/useTransactionMonitor';
import { Button } from '../ui/Button';
import { useDispatch, useSelector } from 'react-redux';
import { setCreateCollectionModalOpen, addNotification } from '../../store/slices/uiSlice';
import { Modal } from '../ui/Modal';
import { TransactionStatus } from '../TransactionStatus';
import { RootState } from '../../store';

export function CreateCollectionModal() {
  const { createCollection, isCreating, isConfirmed } = useCollection();
  const dispatch = useDispatch();
  const { isCreateCollectionModalOpen } = useSelector((state: RootState) => state.ui);
  const [transactionHash, setTransactionHash] = useState<`0x${string}` | undefined>();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateCollectionForm>({
    resolver: zodResolver(createCollectionSchema),
  });

  const onSubmit = async (data: CreateCollectionForm) => {
    console.log('CreateCollectionModal: Submitting collection creation');
    console.log('- Collection name:', data.name);
    console.log('- Collection symbol:', data.symbol);
    
    try {
      const result = await createCollection(data.name, data.symbol);
      console.log('CreateCollectionModal: Collection creation transaction submitted', result);
      
      // Store transaction hash for monitoring
      if (result) {
        setTransactionHash(result as `0x${string}`);
      }
      
      // Don't close modal immediately, wait for confirmation
      dispatch(
        addNotification({
          type: 'info',
          title: 'Transaction Submitted',
          message: `Your collection "${data.name}" creation transaction has been submitted. Waiting for confirmation...`,
        })
      );
    } catch (error) {
      console.error('CreateCollectionModal: Collection creation failed', error);
      dispatch(
        addNotification({
          type: 'error',
          title: 'Creation Failed',
          message: 'Failed to create collection. Please try again.',
        })
      );
    }
  };

  // Handle transaction confirmation
  const handleTransactionSuccess = () => {
    console.log('CreateCollectionModal: Transaction confirmed successfully');
    dispatch(
      addNotification({
        type: 'success',
        title: 'Collection Created',
        message: `Your collection has been created successfully!`,
      })
    );
    
    dispatch(setCreateCollectionModalOpen(false));
    reset();
    setTransactionHash(undefined);
  };

  const handleTransactionError = () => {
    console.error('CreateCollectionModal: Transaction failed');
    dispatch(
      addNotification({
        type: 'error',
        title: 'Transaction Failed',
        message: 'The collection creation transaction failed. Please try again.',
      })
    );
    setTransactionHash(undefined);
  };

  return (
    <Modal
      isOpen={isCreateCollectionModalOpen}
      onClose={() => dispatch(setCreateCollectionModalOpen(false))}
      title="Create New Collection"
    >
      {/* Transaction Status */}
      {transactionHash && (
        <div className="mb-4">
          <TransactionStatus
            hash={transactionHash}
            onSuccess={handleTransactionSuccess}
            onError={handleTransactionError}
          />
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Collection Name *
          </label>
          <input
            id="name"
            type="text"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-black focus:ring-primary-500 ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            {...register('name')}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="symbol" className="block text-sm font-medium text-gray-700 mb-1">
            Symbol *
          </label>
          <input
            id="symbol"
            type="text"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none text-black focus:ring-2 focus:ring-primary-500 uppercase ${
              errors.symbol ? 'border-red-500' : 'border-gray-300'
            }`}
            {...register('symbol')}
          />
          {errors.symbol && (
            <p className="mt-1 text-sm text-red-600">{errors.symbol.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Short identifier (2-10 uppercase letters)
          </p>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            id="description"
            rows={4}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none text-black focus:ring-2 focus:ring-primary-500 ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
            {...register('description')}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => dispatch(setCreateCollectionModalOpen(false))}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || isCreating || !!transactionHash}
            className="flex-1"
          >
            {isSubmitting || isCreating ? 'Creating...' : transactionHash ? 'Processing...' : 'Create Collection'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
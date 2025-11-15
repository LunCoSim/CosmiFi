'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createCollectionSchema, CreateCollectionForm } from '../../utils/validations';
import { useCollection } from '../../hooks/useCollection';
import { Button } from '../ui/Button';
import { useDispatch, useSelector } from 'react-redux';
import { setCreateCollectionModalOpen, addNotification } from '../../store/slices/uiSlice';
import { Modal } from '../ui/Modal';
import { RootState } from '../../store';

export function CreateCollectionModal() {
  const { createCollection, isCreating } = useCollection();
  const dispatch = useDispatch();
  const { isCreateCollectionModalOpen } = useSelector((state: RootState) => state.ui);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateCollectionForm>({
    resolver: zodResolver(createCollectionSchema),
  });

  const onSubmit = async (data: CreateCollectionForm) => {
    try {
      await createCollection(data.name, data.symbol);
      
      dispatch(
        addNotification({
          type: 'success',
          title: 'Collection Created',
          message: `Your collection "${data.name}" has been created successfully!`,
        })
      );
      
      dispatch(setCreateCollectionModalOpen(false));
      reset();
    } catch (error) {
      dispatch(
        addNotification({
          type: 'error',
          title: 'Creation Failed',
          message: 'Failed to create collection. Please try again.',
        })
      );
    }
  };

  return (
    <Modal
      isOpen={isCreateCollectionModalOpen}
      onClose={() => dispatch(setCreateCollectionModalOpen(false))}
      title="Create New Collection"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Collection Name *
          </label>
          <input
            id="name"
            type="text"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
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
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 uppercase ${
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
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
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
            disabled={isSubmitting || isCreating}
            className="flex-1"
          >
            {isSubmitting || isCreating ? 'Creating...' : 'Create Collection'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
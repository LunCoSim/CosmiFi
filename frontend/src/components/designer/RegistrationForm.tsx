'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { designerRegistrationSchema, DesignerRegistrationForm } from '../../utils/validations';
import { useDesigner } from '../../hooks/useDesigner';
import { Button } from '../ui/Button';
import { useDispatch } from 'react-redux';
import { setRegisterModalOpen, addNotification } from '../../store/slices/uiSlice';

export function RegistrationForm() {
  const { register, isRegistering } = useDesigner();
  const dispatch = useDispatch();

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<DesignerRegistrationForm>({
    resolver: zodResolver(designerRegistrationSchema),
  });

  const onSubmit = async (data: DesignerRegistrationForm) => {
    try {
      await register();
      
      dispatch(
        addNotification({
          type: 'success',
          title: 'Registration Successful',
          message: 'You are now registered as a designer!',
        })
      );
      
      dispatch(setRegisterModalOpen(false));
      reset();
    } catch (error) {
      dispatch(
        addNotification({
          type: 'error',
          title: 'Registration Failed',
          message: 'Failed to register as a designer. Please try again.',
        })
      );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Register as Designer</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Name *
          </label>
          <input
            id="name"
            type="text"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            {...formRegister('name')}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
            Bio *
          </label>
          <textarea
            id="bio"
            rows={4}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors.bio ? 'border-red-500' : 'border-gray-300'
            }`}
            {...formRegister('bio')}
          />
          {errors.bio && (
            <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            {...formRegister('email')}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
            Website
          </label>
          <input
            id="website"
            type="url"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors.website ? 'border-red-500' : 'border-gray-300'
            }`}
            {...formRegister('website')}
          />
          {errors.website && (
            <p className="mt-1 text-sm text-red-600">{errors.website.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="twitter" className="block text-sm font-medium text-gray-700 mb-1">
            Twitter
          </label>
          <input
            id="twitter"
            type="text"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors.twitter ? 'border-red-500' : 'border-gray-300'
            }`}
            {...formRegister('twitter')}
          />
          {errors.twitter && (
            <p className="mt-1 text-sm text-red-600">{errors.twitter.message}</p>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => dispatch(setRegisterModalOpen(false))}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || isRegistering}
            className="flex-1"
          >
            {isSubmitting || isRegistering ? 'Registering...' : 'Register'}
          </Button>
        </div>
      </form>
    </div>
  );
}
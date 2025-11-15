import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DesignerProfile } from '../../types/designer';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

const editProfileSchema = z.object({
  username: z.string().min(1, 'Username is required').max(50, 'Username must be less than 50 characters'),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  twitter: z.string().optional(),
  farcaster: z.string().optional(),
  gmail: z.string().email('Invalid email address').optional().or(z.literal('')),
  avatarUrl: z.string().optional(),
});

type EditProfileForm = z.infer<typeof editProfileSchema>;

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: DesignerProfile | null;
  onSave: (profile: Partial<DesignerProfile>) => void;
}

export function EditProfileModal({ isOpen, onClose, profile, onSave }: EditProfileModalProps) {
  const [isUploading, setIsUploading] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<EditProfileForm>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      username: '',
      bio: '',
      twitter: '',
      farcaster: '',
      gmail: '',
      avatarUrl: '',
    },
  });

  const avatarUrl = watch('avatarUrl');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // TODO: Implement actual image upload to IPFS or storage service
      // For now, create a temporary URL
      const tempUrl = URL.createObjectURL(file);
      setValue('avatarUrl', tempUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = (data: EditProfileForm) => {
    const updatedProfile: Partial<DesignerProfile> = {
      username: data.username,
      bio: data.bio,
      avatarUrl: data.avatarUrl,
      social_links: {
        twitter: data.twitter,
        farcaster: data.farcaster,
        gmail: data.gmail,
      },
    };
    onSave(updatedProfile);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
        {/* Avatar Upload */}
        <div className="space-y-2 sm:space-y-3">
          <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
            Profile Image
          </label>
          <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <img
              src={avatarUrl || `https://api.dicebear.com/7.x?seed=${watch('username')}&format=svg`}
              alt="Profile"
              className="h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20 rounded-full object-cover transition-all duration-300 hover:scale-105"
            />
            <div className="flex flex-col sm:flex-row items-start space-y-2 sm:space-y-0 sm:space-x-3">
              <input
                type="file"
                id="avatar-upload"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <label
                htmlFor="avatar-upload"
                className="cursor-pointer inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 shadow-sm text-xs sm:text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 hover:scale-105"
              >
                {isUploading ? 'Uploading...' : 'Change Image'}
              </label>
            </div>
          </div>
        </div>

        {/* Username */}
        <div className="space-y-2 sm:space-y-3">
          <label htmlFor="username" className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
            Username
          </label>
          <input
            type="text"
            id="username"
            {...register('username')}
            className={`w-full px-3 py-2 sm:py-3 text-black border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 ${
              errors.username ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your username"
          />
          {errors.username && (
            <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
          )}
        </div>

        {/* Bio */}
        <div className="space-y-2 sm:space-y-3">
          <label htmlFor="bio" className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
            Bio
          </label>
          <textarea
            id="bio"
            {...register('bio')}
            rows={3}
            className={`w-full px-3 py-2 sm:py-3 text-black border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 ${
              errors.bio ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Tell us about yourself"
          />
          {errors.bio && (
            <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
          )}
        </div>

        {/* Social Links */}
        <div className="space-y-2 sm:space-y-3">
          <h3 className="text-sm sm:text-base font-medium text-gray-700 mb-3">Social Links</h3>
          <div className="grid grid-cols-1 sm:grid-cols-1 gap-3 sm:gap-4">
            <div className="space-y-2">
              <label htmlFor="twitter" className="block text-sm sm:text-base text-gray-600 mb-1">
                Twitter
              </label>
              <input
                type="text"
                id="twitter"
                {...register('twitter')}
                className="w-full text-slate-500 px-3 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                placeholder="@username"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="farcaster" className="block text-sm sm:text-base text-gray-600 mb-1">
                Farcaster
              </label>
              <input
                type="text"
                id="farcaster"
                {...register('farcaster')}
                className="w-full text-slate-600 px-3 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                placeholder="username"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="gmail" className="block text-sm sm:text-base text-gray-600 mb-1">
                Gmail
              </label>
              <input
                type="email"
                id="gmail"
                {...register('gmail')}
                className={`w-full text-slate-500 px-3 py-2 sm:py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 ${
                  errors.gmail ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="email@gmail.com"
              />
              {errors.gmail && (
                <p className="mt-1 text-sm text-red-600">{errors.gmail.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t">
          <Button variant="outline" type="button" onClick={onClose} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
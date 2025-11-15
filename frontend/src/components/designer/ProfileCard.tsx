import { DesignerProfile } from '../../types/designer';
import { useAccount } from 'wagmi';
import { useDispatch } from 'react-redux';
import { setEditProfileModalOpen } from '../../store/slices/uiSlice';

interface ProfileCardProps {
  profile: DesignerProfile | null;
  isLoading: boolean;
  error: string | null;
  isDesigner?: boolean;
}

export function ProfileCard({ profile, isLoading, error, isDesigner = false }: ProfileCardProps) {
  const { address } = useAccount();
  const dispatch = useDispatch();
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="text-red-600 text-center">
          <p>Error loading profile: {error}</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="text-gray-600 text-center">
          <p>No profile found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 transition-all duration-300 hover:shadow-lg">
      <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4 lg:space-x-6">
        {/* Avatar */}
        <div className="flex-shrink-0 mx-auto sm:mx-0">
          <img
            className="h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 rounded-full object-cover transition-all duration-300 hover:scale-105"
            src={profile.avatarUrl || `https://api.dicebear.com/7.x?seed=${profile.username}&format=svg`}
            alt={profile.username}
          />
        </div>

        {/* Profile Info */}
        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
            <div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 transition-colors duration-200">{profile.username}</h2>
              <p className="text-xs sm:text-sm text-gray-500 truncate max-w-full">address: {address}</p>
              <p className="text-xs sm:text-sm text-gray-500">role: {isDesigner ? 'designer' : 'user'}</p>
            </div>
            <button
              className="text-primary-600 hover:text-primary-700 text-xs sm:text-sm font-medium px-3 py-1 sm:px-0 sm:py-0 rounded transition-all duration-200 hover:scale-105 active:scale-95"
              onClick={() => dispatch(setEditProfileModalOpen(true))}
            >
              Edit Profile
            </button>
          </div>

          {/* Bio */}
          {profile.bio && (
            <div className="mt-3 sm:mt-4">
              <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-2 transition-colors duration-200">bio: {profile.bio}</h3>
            </div>
          )}

          {/* Social Links */}
          <div className="mt-4 sm:mt-6 flex flex-wrap gap-2 sm:gap-4 justify-center sm:justify-start">
            {profile.social_links?.twitter && (
              <a
                href={`https://twitter.com/${profile.social_links.twitter.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700 flex items-center space-x-1 p-2 rounded-lg hover:bg-primary-50 transition-all duration-200 hover:scale-105"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.748 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
                <span className="text-xs sm:text-sm">Twitter</span>
              </a>
            )}
            
            {profile.social_links?.farcaster && (
              <a
                href={`https://warpcast.com/${profile.social_links.farcaster}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700 flex items-center space-x-1 p-2 rounded-lg hover:bg-primary-50 transition-all duration-200 hover:scale-105"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                </svg>
                <span className="text-xs sm:text-sm">Farcaster</span>
              </a>
            )}
            
            {profile.social_links?.gmail && (
              <a
                href={`mailto:${profile.social_links.gmail}`}
                className="text-primary-600 hover:text-primary-700 flex items-center space-x-1 p-2 rounded-lg hover:bg-primary-50 transition-all duration-200 hover:scale-105"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
                <span className="text-xs sm:text-sm">Gmail</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
'use client';

import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useDesigner } from '../../src/hooks/useDesigner';
import { useCollection } from '../../src/hooks/useCollection';
import { useProfile } from '../../src/hooks/useProfile';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../src/store';
import { setRegisterModalOpen, setCreateCollectionModalOpen, setEditProfileModalOpen } from '../../src/store/slices/uiSlice';
import { WalletButton } from '../../src/components/wallet/WalletButton';
import { CollectionGrid } from '../../src/components/designer/CollectionGrid';
import { ProfileCard } from '../../src/components/designer/ProfileCard';
import { Button } from '../../src/components/ui/Button';
import { RegistrationForm } from '../../src/components/designer/RegistrationForm';
import { CreateCollectionModal } from '../../src/components/designer/CreateCollectionModal';
import { EditProfileModal } from '../../src/components/designer/EditProfileModal';
import { Modal } from '../../src/components/ui/Modal';
import { Collection } from '../../src/types/collection';
import { PageLoading } from '../../src/components/ui/Loading';

export default function DesignerDashboard() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const { isDesigner, isCheckingDesigner } = useDesigner();
  const { collections, isLoadingCollections } = useCollection();
  const { profile, isLoading: isLoadingProfile, error: profileError } = useProfile();
  const dispatch = useDispatch();
  const { isRegisterModalOpen, isEditProfileModalOpen } = useSelector((state: RootState) => state.ui);

  useEffect(() => {
   
    
    // Redirect to home if not connected using Next.js router
    if (!isConnected) {
      console.log('Redirecting to home - wallet not connected');
      router.push('/');
    }
  }, [isConnected, address, isDesigner, router, collections]);

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center  bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h1>
          <p className="text-gray-600 mb-6">Please connect your wallet to access the designer dashboard</p>
          <WalletButton />
        </div>
      </div>
    );
  }

  if (isCheckingDesigner) {
    return <PageLoading text="Checking designer status..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50  px-10">
      <header className="bg-white shadow-sm border-b px-6">
        <div className="container-responsive">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 transition-colors duration-200">Designer Dashboard</h1>
           
          </div>
        </div>
      </header>

      <main className="container-responsive py-6 sm:py-8 ">
    
        {!!isDesigner && (
          <div>
            <ProfileCard
              profile={profile}
              isLoading={isLoadingProfile}
              error={profileError}
              isDesigner={!!isDesigner}
            />
          </div>
        )}

        {!isDesigner ? (
          <div className="text-center py-8 sm:py-12">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 transition-colors duration-200">Become a Designer</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 transition-colors duration-200">
              Register as a designer to create collections and mint NFTs
            </p>
            <Button onClick={() => dispatch(setRegisterModalOpen(true))} className="fade-in">
              Register as Designer
            </Button>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8 mx-9">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 sm:mb-4 transition-colors duration-200">Your Collections</h2>
                <p className="text-sm sm:text-base text-gray-600 transition-colors duration-200">
                  Manage your NFT collections and create new ones
                </p>
              </div>
              <Button onClick={() => dispatch(setCreateCollectionModalOpen(true))} className="fade-in">
                Create Collection
              </Button>
            </div>

            <CollectionGrid
              collections={collections as Collection[]}
              currentDesignerAddress={address}
              onViewCollection={(collection: Collection) => {
                // Navigate to collection detail page using Next.js router
                router.push(`/collection/${collection.address}`);
              }}
              onMintNFT={(collection: Collection) => {
                // Navigate to mint page using Next.js router
                router.push(`/collection/${collection.address}/mint`);
              }}
              isLoading={isLoadingCollections}
            />
          </div>
        )}
      </main>

      {/* Modals */}
      {isRegisterModalOpen && (
        <Modal
          isOpen={isRegisterModalOpen}
          onClose={() => dispatch(setRegisterModalOpen(false))}
          title="Register as Designer"
          size="lg"
        >
          <RegistrationForm />
        </Modal>
      )}

      <CreateCollectionModal />
      
      {/* Edit Profile Modal */}
      {isEditProfileModalOpen && (
        <EditProfileModal
          isOpen={isEditProfileModalOpen}
          onClose={() => dispatch(setEditProfileModalOpen(false))}
          profile={profile}
          onSave={(updatedProfile) => {
            // TODO: Implement actual profile update logic
            console.log('Updating profile:', updatedProfile);
            // This would typically call an API to update the profile
          }}
        />
      )}
    </div>
  );
}

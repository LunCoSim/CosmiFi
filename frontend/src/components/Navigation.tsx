'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAccount, useBalance } from 'wagmi';
import { formatEther } from 'viem';
import { Bars3Icon, XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { WalletButton } from './wallet/WalletButton';
import { useDesigner } from '../hooks/useDesigner';
import { useWalletContext } from '../contexts/WalletContext';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { TransactionStatus } from './TransactionStatus';

export function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const { isReconnecting, reconnect } = useWalletContext();
  const {
    isDesigner,
    isCheckingDesigner,
    isRegistering,
    register,
    isRegisteringModalOpen,
    setIsRegisteringModalOpen,
    isConfirmed
  } = useDesigner();

  const handleRegisterDesigner = () => {
    register();
  };

  const navigation = [
    { name: 'Collections', href: '/collection' },
    { name: 'Designer', href: isDesigner ? '/designer' : '#', disabled: !isDesigner && isConnected },
  ];

  useEffect(() => {
    console.log('Navigation component loaded');
    console.log('Is connected:', isConnected);
    console.log('Is designer:', isDesigner);
    console.log('Is checking designer:', isCheckingDesigner);
    console.log('Is reconnecting:', isReconnecting);
  }, [isConnected, isDesigner, isCheckingDesigner, isReconnecting]);

  // Add logging to track wallet state during navigation
  useEffect(() => {
    console.log('Navigation: Wallet state changed');
    console.log('- isConnected:', isConnected);
    console.log('- address:', address);
    console.log('- isDesigner:', isDesigner);
    console.log('- isReconnecting:', isReconnecting);
  }, [isConnected, address, isDesigner, isReconnecting]);
return (
  <>
    <nav className="bg-white shadow-lg sticky top-0 z-50 transition-all mb-10 px-10 duration-300">
      <div className="container-responsive">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 flex items-center transition-transform duration-200 hover:scale-105">
              <h1 className="text-xl sm:text-2xl font-bold text-primary-600">CosmiFi</h1>
            </Link>
            

            {/* Desktop Navigation */}
            <div className="hidden md:ml-6 lg:ml-10 md:flex md:space-x-6 lg:space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`inline-flex items-center px-2 sm:px-3 pt-1 text-sm sm:text-base font-medium transition-all duration-200 hover:scale-105 ${
                    item.disabled
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-900 hover:text-primary-600'
                  }`}
                  onClick={(e) => item.disabled && e.preventDefault()}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Wallet Balance - Hidden on mobile, shown in slide menu
            <div className="hidden md:block">
              {isConnected && balance && (
                <span className="text-sm sm:text-base text-gray-700 transition-colors duration-200">
                  {parseFloat(formatEther(balance.value)).toFixed(4)} {balance.symbol}
                </span>
              )}
            </div> */}

            {/* Wallet Connection */}
            <WalletButton />
            

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                type="button"
                className="bg-gray-100 p-2 sm:p-3 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 transition-all duration-200 hover:scale-105 active:scale-95"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="block h-5 w-5 sm:h-6 sm:w-6 transition-transform duration-200" aria-hidden="true" />
                ) : (
                  <Bars3Icon className="block h-5 w-5 sm:h-6 sm:w-6 transition-transform duration-200" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'} transition-all duration-300 ease-in-out`}>
        <div className="px-2 sm:px-4 pt-2 sm:pt-4 pb-3 sm:pb-6 space-y-1 sm:space-y-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`block px-3 py-2 sm:px-4 sm:py-3 rounded-md text-base sm:text-lg font-medium transition-all duration-200 hover:scale-105 ${
                item.disabled
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
              }`}
              onClick={(e) => {
                if (item.disabled) {
                  e.preventDefault();
                } else {
                  setIsMobileMenuOpen(false);
                }
              }}
            >
              {item.name}
            </Link>
          ))}
          
          {/* Mobile wallet balance - Now shown in slide menu */}
          {isConnected && balance && (
            <div className="px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-700 transition-colors duration-200">
              Balance: {parseFloat(formatEther(balance.value)).toFixed(4)} {balance.symbol}
            </div>
          )}
        </div>
      </div>
    </nav>
      {/* Designer Registration Modal */}
      <Modal
        isOpen={isRegisteringModalOpen}
        onClose={() => setIsRegisteringModalOpen(false)}
        title="Register as Designer"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            To access the designer page and create collections, you need to register as a designer on the platform.
          </p>
          
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-sm text-gray-700">
              <strong>Wallet Address:</strong> {address}
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setIsRegisteringModalOpen(false)}
              disabled={isRegistering}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRegisterDesigner}
              disabled={isRegistering}
            >
              {isRegistering ? 'Registering...' : 'Register'}
            </Button>
          </div>

          {isConfirmed && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-800">
                Successfully registered as a designer! You can now access the designer page.
              </p>
            </div>
          )}
        </div>
      </Modal>

      {/* Transaction Status */}
      {isRegistering && (
        <TransactionStatus
          hash={undefined} // Will be populated by the hook
          onSuccess={() => {
            // Registration successful
          }}
          onError={() => {
            // Registration failed
          }}
        />
      )}

      {/* Designer Registration Prompt */}
      {isConnected && !isCheckingDesigner && !isDesigner && (
        <div className="bg-blue-50 border-b border-blue-200">
          <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between flex-wrap">
              <div className="w-0 flex-1 flex items-center">
                <p className="ml-3 font-medium text-blue-900 truncate">
                  <span className="md:hidden">Register as a designer to create collections</span>
                  <span className="hidden md:inline">
                    Register as a designer to access the designer page and create your own NFT collections
                  </span>
                </p>
              </div>
              <div className="order-2 flex-shrink-0 sm:order-3 sm:ml-3">
                <Button
                  size="sm"
                  onClick={() => setIsRegisteringModalOpen(true)}
                >
                  Register Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reconnection Banner */}
      {isReconnecting && (
        <div className="bg-yellow-50 border-b border-yellow-200">
          <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2" />
                <p className="text-yellow-800 text-sm">
                  Reconnecting to your wallet...
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={reconnect}
                disabled={isReconnecting}
              >
                {isReconnecting ? 'Reconnecting...' : 'Reconnect Now'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
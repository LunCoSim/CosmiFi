import { useEffect, useRef } from 'react';
import { useWatchContractEvent } from 'wagmi';
import { CONTRACTS } from '../contracts';
import { Address } from 'viem';
import { Log } from 'viem';

interface EventListeners {
  onCollectionCreated?: (data: any) => void;
  onNFTMinted?: (data: any) => void;
  onDesignerRegistered?: (data: any) => void;
}

export function useContractEvents(address?: Address, listeners: EventListeners = {}) {
  const listenersRef = useRef(listeners);
  
  // Update ref when listeners change
  useEffect(() => {
    listenersRef.current = listeners;
  }, [listeners]);

  // Listen for collection creation events
  useWatchContractEvent({
    ...CONTRACTS.BLUEPRINT_FACTORY,
    address: CONTRACTS.BLUEPRINT_FACTORY?.address,
    eventName: 'CollectionCreated',
    args: address ? [address] : undefined,
    onLogs: (logs: Log[]) => {
      console.log('CollectionCreated event detected:', logs);
      if (listenersRef.current.onCollectionCreated) {
        logs.forEach(log => {
          // Parse the log data to extract event arguments
          const event = log as any;
          listenersRef.current.onCollectionCreated!(event.args || {});
        });
      }
    },
    pollingInterval: 4_000, // Check every 4 seconds instead of constant polling
  });

  // Listen for NFT minted events
  useWatchContractEvent({
    ...CONTRACTS.BLUEPRINT_NFT,
    address: address,
    eventName: 'Transfer', // ERC721 Transfer event indicates minting when from is 0x0
    args: address ? ['0x0000000000000000000000000000000000000000', null] : undefined,
    onLogs: (logs: Log[]) => {
      console.log('NFT minted (Transfer) event detected:', logs);
      if (listenersRef.current.onNFTMinted) {
        logs.forEach(log => {
          // Parse the log data to extract event arguments
          const event = log as any;
          // Only process if this is a mint (from address is zero address)
          if (event.args?.from === '0x0000000000000000000000000000000000000000') {
            listenersRef.current.onNFTMinted!(event.args || {});
          }
        });
      }
    },
    pollingInterval: 4_000,
  });

  // Listen for designer registration events
  useWatchContractEvent({
    ...CONTRACTS.DESIGNER_REGISTRY,
    address: CONTRACTS.DESIGNER_REGISTRY?.address,
    eventName: 'DesignerRegistered',
    args: address ? [address] : undefined,
    onLogs: (logs: Log[]) => {
      console.log('DesignerRegistered event detected:', logs);
      if (listenersRef.current.onDesignerRegistered) {
        logs.forEach(log => {
          // Parse the log data to extract event arguments
          const event = log as any;
          listenersRef.current.onDesignerRegistered!(event.args || {});
        });
      }
    },
    pollingInterval: 4_000,
  });
}

// Hook for specific collection events
export function useCollectionEvents(collectionAddress: Address, listeners: EventListeners = {}) {
  const listenersRef = useRef(listeners);
  
  useEffect(() => {
    listenersRef.current = listeners;
  }, [listeners]);

  // Listen for NFT minted events for this specific collection
  useWatchContractEvent({
    ...CONTRACTS.BLUEPRINT_NFT,
    address: collectionAddress,
    eventName: 'Transfer',
    args: ['0x0000000000000000000000000000000000000000', null],
    onLogs: (logs: Log[]) => {
      console.log(`NFT minted event for collection ${collectionAddress}:`, logs);
      if (listenersRef.current.onNFTMinted) {
        logs.forEach(log => {
          // Parse the log data to extract event arguments
          const event = log as any;
          if (event.args?.from === '0x0000000000000000000000000000000000000000') {
            listenersRef.current.onNFTMinted!(event.args || {});
          }
        });
      }
    },
    pollingInterval: 4_000,
  });
}
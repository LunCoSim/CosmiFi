import { useAccount } from 'wagmi';
import { useIsDesigner, useRegisterDesigner } from './useContract';
import { useEffect, useState, useCallback } from 'react';
import { useContractEvents } from './useContractEvents';
import { useQueryClient } from '@tanstack/react-query';

export function useDesigner() {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const { data: isDesigner, isLoading: isCheckingDesigner } = useIsDesigner(address);
  const { register, isPending: isRegistering, isConfirmed } = useRegisterDesigner();
  
  const [isRegisteringModalOpen, setIsRegisteringModalOpen] = useState(false);

  // Listen for designer registration events to update UI in real-time
  useContractEvents(address, {
    onDesignerRegistered: useCallback((data: any) => {
      console.log('useDesigner: DesignerRegistered event received', data);
      // Invalidate the isDesigner query to trigger refetch
      queryClient.invalidateQueries({
        queryKey: ['readContract', { 
          address: address,
          functionName: 'isDesigner'
        }]
      });
      console.log('useDesigner: Invalidated isDesigner query for address:', address);
    }, [address, queryClient]),
  });

  useEffect(() => {
    if (isConfirmed) {
      setIsRegisteringModalOpen(false);
    }
  }, [isConfirmed]);

  return {
    address,
    isDesigner,
    isCheckingDesigner,
    isRegistering,
    isConfirmed,
    register,
    isRegisteringModalOpen,
    setIsRegisteringModalOpen,
  };
}
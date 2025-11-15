import { useAccount } from 'wagmi';
import { useIsDesigner, useRegisterDesigner } from './useContract';
import { useEffect, useState } from 'react';

export function useDesigner() {
  const { address } = useAccount();
  const { data: isDesigner, isLoading: isCheckingDesigner } = useIsDesigner(address);
  const { register, isPending: isRegistering, isConfirmed } = useRegisterDesigner();
  
  const [isRegisteringModalOpen, setIsRegisteringModalOpen] = useState(false);

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

import { useGetCars } from './use-get-cars';
import { useAddCar } from './use-add-car';
import { useUpdateCar } from './use-update-car';
import { useAuthContext } from '@/contexts/auth-context';

/**
 * Main hook that combines all car-related hooks
 */
export function useCars() {
  const { agencies } = useAuthContext();
  const getCars = useGetCars();
  const addCar = useAddCar();
  const updateCar = useUpdateCar();
  
  return {
    cars: getCars.data || [],
    isLoading: getCars.isLoading,
    error: getCars.error,
    getCars, // Export the getCars query itself
    addCar,
    updateCar
  };
}

// Re-export individual hooks for direct access if needed
export { useGetCars } from './use-get-cars';
export { useAddCar } from './use-add-car';
export { useUpdateCar } from './use-update-car';
export { uploadCarImages } from './use-upload-car-images';

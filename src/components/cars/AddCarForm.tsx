
import React, { useState } from 'react';
import { useAddCar } from '@/hooks/cars/use-add-car';
import { useCars } from '@/hooks/use-cars';
import { useSubscriptionLimits } from '@/hooks/use-subscription-limits';
import { CarFormBase } from './CarFormBase';
import { toast } from 'sonner';

interface AddCarFormProps {
  onSuccess?: () => void;
  className?: string;
}

export function AddCarForm({ onSuccess, className }: AddCarFormProps) {
  const { cars } = useCars();
  const { mutate: addCar, isPending: isLoading } = useAddCar();
  const { checkAndNotifyLimit } = useSubscriptionLimits();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: any, images: File[]) => {
    console.log('🔍 [AddCarForm] handleSubmit called with values:', values);
    
    setIsSubmitting(true);
    try {
      const currentCount = cars?.length || 0;
      console.log('🔍 [AddCarForm] Current cars count:', currentCount);
      
      // בדיקת מגבלות לפני יצירת הרכב
      const canProceed = checkAndNotifyLimit('car', currentCount);
      
      if (!canProceed) {
        console.log('🔍 [AddCarForm] Limit check failed, aborting submission');
        setIsSubmitting(false);
        return;
      }

      console.log('🔍 [AddCarForm] Limit check passed, creating car');
      
      const carData = {
        ...values,
        images
      };
      
      addCar(carData, {
        onSuccess: () => {
          toast.success('רכב חדש נוסף בהצלחה!');
          if (onSuccess) {
            onSuccess();
          }
        },
        onError: (error) => {
          console.error('🔍 [AddCarForm] Error creating car:', error);
          toast.error('שגיאה בהוספת הרכב');
        }
      });
    } catch (error) {
      console.error('🔍 [AddCarForm] Error creating car:', error);
      toast.error('שגיאה בהוספת הרכב');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CarFormBase
      defaultValues={{
        make: '',
        model: '',
        year: '',
        kilometers: '',
        price: '',
        transmission: '',
        fuel_type: '',
        engine_size: '',
        exterior_color: '',
        interior_color: '',
        description: '',
        ownership_history: '',
        entry_date: '',
        license_number: '',
        chassis_number: '',
        next_test_date: '',
        agency_id: ''
      }}
      onSubmit={handleSubmit}
      submitLabel="הוסף רכב"
      isSubmitting={isLoading || isSubmitting}
      className={className}
    />
  );
}

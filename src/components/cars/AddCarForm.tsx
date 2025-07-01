
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
  const { addCar, isLoading } = useAddCar();
  const { checkAndNotifyLimit } = useSubscriptionLimits();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: any, resetForm: () => void) => {
    console.log('🔍 [AddCarForm] handleSubmit called with formData:', formData);
    
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
      
      await addCar(formData);
      toast.success('רכב חדש נוסף בהצלחה!');
      resetForm();
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('🔍 [AddCarForm] Error creating car:', error);
      toast.error('שגיאה בהוספת הרכב');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CarFormBase
      onSubmit={handleSubmit}
      submitButtonText="הוסף רכב"
      isLoading={isLoading || isSubmitting}
      className={className}
    />
  );
}

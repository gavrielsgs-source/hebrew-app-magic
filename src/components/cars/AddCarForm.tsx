
import React, { useState } from 'react';
import { useAddCar } from '@/hooks/cars/use-add-car';
import { useCars } from '@/hooks/use-cars';
import { useSubscriptionLimits } from '@/hooks/use-subscription-limits';
import { CarFormWizard } from './wizard/CarFormWizard';
import { toast } from 'sonner';
import { useTasks } from '@/hooks/use-tasks';

interface AddCarFormProps {
  onSuccess?: () => void;
  className?: string;
}

export function AddCarForm({ onSuccess, className }: AddCarFormProps) {
  const { cars } = useCars();
  const { mutate: addCar, isPending: isLoading } = useAddCar();
  const { checkAndNotifyLimit } = useSubscriptionLimits();
  const { addTask } = useTasks();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: any, images: File[]) => {
    setIsSubmitting(true);
    try {
      // Count only active cars (not sold/removed)
      const activeCars = cars?.filter(c => c.status !== 'sold' && c.status !== 'removed') || [];
      const currentCount = activeCars.length;
      
      const canProceed = checkAndNotifyLimit('car', currentCount);
      if (!canProceed) {
        setIsSubmitting(false);
        return;
      }

      const carData = {
        ...values,
        images
      };
      
      addCar(carData, {
        onSuccess: async (newCar) => {
          toast.success('רכב חדש נוסף בהצלחה!');
          
          if (values.next_test_date && newCar) {
            try {
              await addTask.mutateAsync({
                title: `טסט לרכב ${values.make} ${values.model}`,
                description: `תאריך טסט לרכב ${values.make} ${values.model} (${values.year}) - מספר רישוי: ${values.license_number || 'לא צוין'}`,
                due_date: new Date(values.next_test_date).toISOString(),
                type: 'test',
                priority: 'high',
                status: 'pending',
                car_id: newCar.id,
                assigned_to: null,
                agency_id: values.agency_id || null,
              });
            } catch (taskError) {
              console.error('Error creating test task:', taskError);
            }
          }
          
          if (onSuccess) onSuccess();
        },
        onError: (error) => {
          console.error('Error creating car:', error);
          toast.error('שגיאה בהוספת הרכב');
        }
      });
    } catch (error) {
      console.error('Error creating car:', error);
      toast.error('שגיאה בהוספת הרכב');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CarFormWizard
      defaultValues={{
        make: '',
        model: '',
        trim_level: '',
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
        registration_year: '',
        last_test_date: '',
        entry_date: '',
        license_number: '',
        chassis_number: '',
        next_test_date: '',
        agency_id: '',
        purchase_cost: '',
        purchase_date: '',
        supplier_name: '',
        car_type: 'regular',
        owner_customer_id: '',
        origin_type: '',
        model_code: '',
        engine_number: '',
        vat_paid: '',
        asking_price: '',
        minimum_price: '',
        list_price: '',
        registration_fee: '',
        is_pledged: 'false',
        show_in_catalog: 'true',
        dealer_price: '',
        catalog_price: '',
        purchase_source: '',
      }}
      onSubmit={handleSubmit}
      submitLabel="הוסף רכב"
      isSubmitting={isLoading || isSubmitting}
    />
  );
}

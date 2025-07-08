
import React, { useState } from 'react';
import { useCreateLead } from '@/hooks/leads/use-create-lead';
import { useLeads } from '@/hooks/use-leads';
import { useSubscriptionLimits } from '@/hooks/use-subscription-limits';
import { LeadFormBase, FormContextValue } from './LeadFormBase';
import { AddLeadNameField } from './AddLeadNameField';
import { AddLeadPhoneField } from './AddLeadPhoneField';
import { AddLeadEmailField } from './AddLeadEmailField';
import { AddLeadSourceField } from './AddLeadSourceField';
import { AddLeadCarField } from './AddLeadCarField';
import { AddLeadNotesField } from './AddLeadNotesField';
import { AddLeadAssignedField } from './AddLeadAssignedField';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface AddLeadFormProps {
  onSuccess?: () => void;
  className?: string;
}

export function AddLeadForm({ onSuccess, className }: AddLeadFormProps) {
  const { leads } = useLeads();
  const { mutate: addLead, isPending: isLoading } = useCreateLead();
  const { checkAndNotifyLimit } = useSubscriptionLimits();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: any) => {
    console.log('🔍 [AddLeadForm] handleSubmit called with values:', values);
    
    setIsSubmitting(true);
    try {
      const currentCount = leads?.length || 0;
      console.log('🔍 [AddLeadForm] Current leads count:', currentCount);
      
      // בדיקת מגבלות לפני יצירת הליד
      const canProceed = checkAndNotifyLimit('lead', currentCount);
      
      if (!canProceed) {
        console.log('🔍 [AddLeadForm] Limit check failed, aborting submission');
        setIsSubmitting(false);
        return;
      }

      console.log('🔍 [AddLeadForm] Limit check passed, creating lead');
      
      addLead(values, {
        onSuccess: () => {
          toast.success('ליד חדש נוצר בהצלחה!');
          if (onSuccess) {
            onSuccess();
          }
        },
        onError: (error) => {
          console.error('🔍 [AddLeadForm] Error creating lead:', error);
          toast.error('שגיאה ביצירת הליד');
        }
      });
    } catch (error) {
      console.error('🔍 [AddLeadForm] Error creating lead:', error);
      toast.error('שגיאה ביצירת הליד');
    } finally {
      setIsSubmitting(false);
    }
  };

  const defaultValues = {
    name: '',
    phone: '',
    email: '',
    source: '',
    car_id: '',
    notes: '',
    assigned_to: '',
    status: 'new'
  };

  return (
    <LeadFormBase
      defaultValues={defaultValues}
      onSubmit={handleSubmit}
      isLoading={isLoading || isSubmitting}
      className={className}
    >
      {({ form, salesAgents, canAssignLeads }: FormContextValue) => (
        <>
          <AddLeadNameField />
          <AddLeadPhoneField />
          <AddLeadEmailField />
          <AddLeadSourceField />
          <AddLeadCarField />
          <AddLeadNotesField />
          {canAssignLeads && (
            <AddLeadAssignedField salesAgents={salesAgents} />
          )}
          
          <div className="flex gap-2 pt-4">
            <Button 
              type="submit" 
              disabled={isLoading || isSubmitting}
              className="w-full"
            >
              {(isLoading || isSubmitting) ? "יוצר..." : "צור ליד"}
            </Button>
          </div>
        </>
      )}
    </LeadFormBase>
  );
}

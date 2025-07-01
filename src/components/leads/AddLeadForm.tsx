
import React, { useState } from 'react';
import { useAddLead } from '@/hooks/leads/use-create-lead';
import { useLeads } from '@/hooks/use-leads';
import { useSubscriptionLimits } from '@/hooks/use-subscription-limits';
import { LeadFormBase } from './LeadFormBase';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface AddLeadFormProps {
  onSuccess?: () => void;
  className?: string;
}

export function AddLeadForm({ onSuccess, className }: AddLeadFormProps) {
  const { leads } = useLeads();
  const { addLead, isLoading } = useAddLead();
  const { checkAndNotifyLimit } = useSubscriptionLimits();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: any, resetForm: () => void) => {
    console.log('🔍 [AddLeadForm] handleSubmit called with formData:', formData);
    
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
      
      await addLead(formData);
      toast.success('ליד חדש נוצר בהצלחה!');
      resetForm();
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('🔍 [AddLeadForm] Error creating lead:', error);
      toast.error('שגיאה ביצירת הליד');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LeadFormBase
      onSubmit={handleSubmit}
      submitButtonText="צור ליד"
      isLoading={isLoading || isSubmitting}
      className={className}
    />
  );
}


import React, { useState } from 'react';
import { useCreateLead } from '@/hooks/leads/use-create-lead';
import { useLeads } from '@/hooks/use-leads';
import { useSubscriptionLimits } from '@/hooks/use-subscription-limits';
import { useAuth } from '@/hooks/use-auth';
import { LeadFormBase, FormContextValue } from './LeadFormBase';
import { AddLeadNameField } from './AddLeadNameField';
import { AddLeadPhoneField } from './AddLeadPhoneField';
import { AddLeadEmailField } from './AddLeadEmailField';
import { AddLeadSourceField } from './AddLeadSourceField';
import { AddLeadCarField } from './AddLeadCarField';
import { AddLeadNotesField } from './AddLeadNotesField';
import { AddLeadAssignedField } from './AddLeadAssignedField';
import { AddLeadInterestedCarFields } from './AddLeadInterestedCarFields';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface AddLeadFormProps {
  onSuccess?: () => void;
  className?: string;
}

export function AddLeadForm({ onSuccess, className }: AddLeadFormProps) {
  const { user } = useAuth();
  const { leads } = useLeads();
  const { mutate: addLead, isPending: isLoading } = useCreateLead();
  const { checkAndNotifyLimit } = useSubscriptionLimits();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sendWhatsApp, setSendWhatsApp] = useState(false);

  const handleSubmit = async (values: any) => {
    console.log('🔍 [AddLeadForm] handleSubmit called with values:', values);
    
    if (!user?.id) {
      console.error('🔍 [AddLeadForm] No user found');
      toast.error('אנא התחבר מחדש למערכת');
      return;
    }
    
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
      
      // הוספת user_id לנתונים
      const leadData = {
        ...values,
        user_id: user.id,
        status: values.status || 'new'
      };

      console.log('🔍 [AddLeadForm] Final lead data with user_id:', leadData);
      
      addLead({ leadData, sendWhatsApp }, {
        onSuccess: () => {
          toast.success('ליד חדש נוצר בהצלחה!');
          if (onSuccess) {
            onSuccess();
          }
        },
        onError: (error) => {
          console.error('🔍 [AddLeadForm] Error creating lead:', error);
          toast.error('שגיאה ביצירת הליד: ' + error.message);
        }
      });
    } catch (error) {
      console.error('🔍 [AddLeadForm] Unexpected error:', error);
      toast.error('שגיאה לא צפויה ביצירת הליד');
    } finally {
      setIsSubmitting(false);
    }
  };

  const defaultValues = {
    name: '',
    phone: '',
    email: '',
    source: 'ידני',
    car_id: '',
    notes: '',
    assigned_to: '',
    status: 'new',
    interested_make: '',
    interested_model: '',
    interested_year_from: '',
    interested_year_to: '',
    interested_max_price: '',
    interested_max_km: '',
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
          <AddLeadNameField control={form.control} />
          <AddLeadPhoneField control={form.control} />
          <AddLeadEmailField control={form.control} />
          <AddLeadSourceField control={form.control} />
          <AddLeadCarField control={form.control} />
          <AddLeadNotesField control={form.control} />
          
          {/* WhatsApp checkbox hidden - will be re-enabled later */}
          
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

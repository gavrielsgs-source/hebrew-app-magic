
import React, { useState } from 'react';
import { useTasks } from '@/hooks/use-tasks';
import { useSubscriptionLimits } from '@/hooks/use-subscription-limits';
import { TaskFormContent } from './form/TaskFormContent';
import { toast } from 'sonner';

interface AddTaskFormWithLimitsProps {
  onSuccess?: () => void;
  className?: string;
}

export function AddTaskFormWithLimits({ onSuccess, className }: AddTaskFormWithLimitsProps) {
  const { tasks, addTask } = useTasks();
  const { checkAndNotifyLimit } = useSubscriptionLimits();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: any) => {
    console.log('🔍 [AddTaskFormWithLimits] handleSubmit called with formData:', formData);
    
    setIsSubmitting(true);
    try {
      const currentCount = tasks?.length || 0;
      console.log('🔍 [AddTaskFormWithLimits] Current tasks count:', currentCount);
      
      // בדיקת מגבלות לפני יצירת המשימה
      const canProceed = checkAndNotifyLimit('task', currentCount);
      
      if (!canProceed) {
        console.log('🔍 [AddTaskFormWithLimits] Limit check failed, aborting submission');
        setIsSubmitting(false);
        return;
      }

      console.log('🔍 [AddTaskFormWithLimits] Limit check passed, creating task');
      
      await addTask.mutateAsync(formData);
      toast.success('משימה חדשה נוצרה בהצלחה!');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('🔍 [AddTaskFormWithLimits] Error creating task:', error);
      toast.error('שגיאה ביצירת המשימה');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <TaskFormContent
      onTaskCreated={onSuccess}
      isSubmitting={addTask.isPending || isSubmitting}
      onSubmit={handleSubmit}
      className={className}
    />
  );
}


import React, { useState } from 'react';
import { useTasks } from '@/hooks/use-tasks';
import { useSubscriptionLimits } from '@/hooks/use-subscription-limits';
import { TaskFormContent } from './form/TaskFormContent';
import { toast } from 'sonner';

interface AddTaskFormWithLimitsProps {
  onSuccess?: () => void;
  className?: string;
  initialLeadId?: string;
  initialCarId?: string;
  initialDate?: Date | null;
}

export function AddTaskFormWithLimits({ 
  onSuccess, 
  className,
  initialLeadId,
  initialCarId,
  initialDate
}: AddTaskFormWithLimitsProps) {
  const { tasks, addTask } = useTasks();
  const { checkAndNotifyLimit } = useSubscriptionLimits();

  const handleSuccess = () => {
    console.log('🔍 [AddTaskFormWithLimits] Task created successfully');
    
    const currentCount = tasks?.length || 0;
    console.log('🔍 [AddTaskFormWithLimits] Current tasks count after creation:', currentCount);
    
    // בדיקת מגבלות אחרי יצירת המשימה (רק להתרעה)
    checkAndNotifyLimit('task', currentCount);
    
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <TaskFormContent
      onSuccess={handleSuccess}
      initialLeadId={initialLeadId}
      initialCarId={initialCarId}
      initialDate={initialDate}
      className={className}
    />
  );
}

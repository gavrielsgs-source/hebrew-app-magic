
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { leadFormSchema, LeadFormValues } from "./schemas/lead-form-schema";
import { useAuth } from "@/hooks/use-auth";
import { useRoles } from "@/hooks/use-roles";
import { useUserManagement } from "@/hooks/use-user-management";
import { useState, useEffect } from "react";

interface LeadFormBaseProps {
  defaultValues: Partial<LeadFormValues>;
  onSubmit: (values: LeadFormValues) => Promise<void>;
  children: React.ReactNode;
  isSubmitting?: boolean;
}

export function LeadFormBase({ defaultValues, onSubmit, children, isSubmitting }: LeadFormBaseProps) {
  const { user } = useAuth();
  const { isAdmin, isAgencyManager } = useRoles();
  const { allUsers } = useUserManagement();
  const [salesAgents, setSalesAgents] = useState<any[]>([]);

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (allUsers && allUsers.length > 0) {
      const agents = allUsers.filter(user =>
        user.roles?.some(r => r.role === 'sales_agent' || r.role === 'admin') || false
      );
      setSalesAgents(agents);
    }
  }, [allUsers]);

  const handleSubmit = async (values: LeadFormValues) => {
    await onSubmit(values);
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 mt-4">
        {typeof children === 'function' ? children({ form, salesAgents, canAssignLeads: isAdmin() || isAgencyManager() }) : children}
      </form>
    </Form>
  );
}

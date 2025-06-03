
import { useFetchLeads } from "./leads/use-fetch-leads";
import { useDeleteLead } from "./leads/use-delete-lead";
import { useCreateLead } from "./leads/use-create-lead";
import { useUpdateLead } from "./leads/use-update-lead";
import { useCreateReminder, useUpdateReminder } from "./leads/use-reminders";

export const useLeads = () => {
  return useFetchLeads();
};

export { useDeleteLead };
export { useCreateLead };
export { useUpdateLead };
export { useCreateReminder, useUpdateReminder };

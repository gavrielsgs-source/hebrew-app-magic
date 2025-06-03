
import { useFetchLeads } from "./leads/use-fetch-leads";
import { useDeleteLead } from "./leads/use-delete-lead";

export const useLeads = () => {
  return useFetchLeads();
};

export { useDeleteLead };

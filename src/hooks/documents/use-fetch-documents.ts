
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export function useFetchDocuments(entityType?: string, entityId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['documents', entityType || null, entityId || null, user?.id],
    queryFn: async () => {
      if (!user) return [];

      console.log('Fetching documents with params:', { entityType, entityId, userId: user.id });

      let query = supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Only filter by entity if both entityType and entityId are provided
      if (entityType && entityId) {
        query = query
          .eq('entity_type', entityType)
          .eq('entity_id', entityId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching documents:', error);
        throw error;
      }

      console.log('Fetched documents:', data);
      return data || [];
    },
    enabled: !!user,
    staleTime: 30000, // Keep data fresh for 30 seconds
    refetchOnWindowFocus: false, // Don't refetch when window gains focus
  });
}

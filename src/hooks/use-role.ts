
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";

interface Role {
  id: string;
  name: string;
}

export function useRole() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["role", user?.id],
    queryFn: async (): Promise<Role | null> => {
      if (!user) {
        return null;
      }

      // Since there's no roles table or role_id in user, return a default role
      // This can be updated when proper role system is implemented
      return {
        id: "default",
        name: "user"
      };
    },
    enabled: !!user,
  });
}

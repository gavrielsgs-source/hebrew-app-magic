
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRoles } from "@/hooks/use-roles";
import { useAgencies } from "@/hooks/use-agencies";
import { UserRole } from "@/types/user";

interface AuthContextType {
  isAdmin: boolean;
  hasRole: (role: UserRole, agencyId?: string) => boolean;
  isLoading: boolean;
  agencies: any[];
  agenciesLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isAdmin: false,
  hasRole: () => false,
  isLoading: true,
  agencies: [],
  agenciesLoading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { hasRole, isAdmin, isLoading: rolesLoading } = useRoles();
  const { agencies, isLoading: agenciesLoading } = useAgencies();

  return (
    <AuthContext.Provider
      value={{
        isAdmin: isAdmin(),
        hasRole,
        isLoading: authLoading || rolesLoading,
        agencies,
        agenciesLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => useContext(AuthContext);

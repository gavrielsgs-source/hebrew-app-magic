
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";

interface AuthContextType {
  isAdmin: boolean;
  hasRole: (role: string, agencyId?: string) => boolean;
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(authLoading);
  }, [authLoading]);

  // Simplified implementation - no role checking
  const contextValue = {
    isAdmin: false,
    hasRole: () => false,
    isLoading,
    agencies: [],
    agenciesLoading: false,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => useContext(AuthContext);


export type UserRole = 'admin' | 'agency_manager' | 'sales_agent' | 'viewer';

export interface UserRoleAssignment {
  id: string;
  user_id: string;
  role: UserRole;
  agency_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Agency {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  roles: UserRoleAssignment[];
  full_name?: string;
}

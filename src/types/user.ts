
// Multi-user system types
export type UserRole = 'admin' | 'company_owner' | 'agency_manager' | 'sales_agent' | 'viewer';

export interface Company {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface UserRoleAssignment {
  id: string;
  user_id: string;
  role: UserRole;
  agency_id: string | null;
  company_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Agency {
  id: string;
  name: string;
  owner_id: string;
  company_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserInvitation {
  id: string;
  company_id: string;
  agency_id: string | null;
  email: string;
  role: UserRole;
  invited_by: string;
  token: string;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  roles: UserRoleAssignment[];
  full_name?: string;
  companies?: Company[];
}

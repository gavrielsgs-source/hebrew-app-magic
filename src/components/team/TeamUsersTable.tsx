import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Shield, Eye, DollarSign, Users, Crown, Trash2, Edit } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useIsMobile } from "@/hooks/use-mobile";

export type TeamUserRole = 'admin' | 'sales_agent' | 'viewer' | 'agency_manager';

export interface TeamUser {
  id: string;
  email: string;
  name: string;
  role: TeamUserRole;
  isOwner?: boolean;
  joinedAt: string;
}

interface TeamUsersTableProps {
  users: TeamUser[];
  onEditUser?: (user: TeamUser) => void;
  onDeleteUser?: (userId: string) => void;
  onChangeRole?: (userId: string, newRole: TeamUserRole) => void;
}

const roleConfig: Record<TeamUserRole, { label: string; icon: React.ComponentType<any>; color: string; bgColor: string }> = {
  admin: {
    label: 'מנהל מערכת',
    icon: Shield,
    color: 'text-red-700',
    bgColor: 'bg-red-100'
  },
  sales_agent: {
    label: 'איש מכירות',
    icon: Users,
    color: 'text-blue-700',
    bgColor: 'bg-blue-100'
  },
  viewer: {
    label: 'צפייה בלבד',
    icon: Eye,
    color: 'text-gray-700',
    bgColor: 'bg-gray-100'
  },
  agency_manager: {
    label: 'מנהל סוכנות',
    icon: DollarSign,
    color: 'text-green-700',
    bgColor: 'bg-green-100'
  }
};

export function TeamUsersTable({ users, onEditUser, onDeleteUser, onChangeRole }: TeamUsersTableProps) {
  const isMobile = useIsMobile();

  const getRoleBadge = (role: TeamUserRole, isOwner?: boolean) => {
    if (isOwner) {
      return (
        <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
          <Crown className="h-3 w-3 mr-1" />
          בעל החשבון
        </Badge>
      );
    }

    const config = roleConfig[role];
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.bgColor} ${config.color} border-transparent`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getInitials = (email: string, name?: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  const renderActions = (user: TeamUser) => {
    if (user.isOwner) return null;
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-9 w-9 p-0 rounded-xl hover:bg-slate-100">
            <span className="sr-only">פתח תפריט</span>
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-white rounded-2xl shadow-2xl border-2 z-50">
          {onEditUser && (
            <DropdownMenuItem onClick={() => onEditUser(user)}>
              <Edit className="mr-2 h-4 w-4" />
              ערוך פרטים
            </DropdownMenuItem>
          )}
          {onChangeRole && (
            <>
              {Object.entries(roleConfig).map(([roleKey, config]) => {
                if (roleKey === user.role) return null;
                const Icon = config.icon;
                return (
                  <DropdownMenuItem
                    key={roleKey}
                    onClick={() => onChangeRole(user.id, roleKey as TeamUserRole)}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    שנה ל{config.label}
                  </DropdownMenuItem>
                );
              })}
            </>
          )}
          {onDeleteUser && (
            <DropdownMenuItem
              onClick={() => onDeleteUser(user.id)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              הסר משתמש
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  // Mobile card layout
  if (isMobile) {
    return (
      <div className="space-y-3">
        {users.map((user) => (
          <div key={user.id} className="bg-white border-2 border-slate-200 rounded-2xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Avatar className="h-10 w-10 shadow-md shrink-0">
                  <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-primary/20 to-primary/10">
                    {getInitials(user.email, user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-right min-w-0 flex-1">
                  <div className="font-semibold text-base text-slate-800 truncate">{user.name}</div>
                  <div className="text-sm text-slate-500 truncate">{user.email}</div>
                </div>
              </div>
              {renderActions(user)}
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
              {getRoleBadge(user.role, user.isOwner)}
              <span className="text-xs text-slate-500">
                {new Date(user.joinedAt).toLocaleDateString('he-IL')}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Desktop table layout
  return (
    <div className="rounded-2xl border-2 border-slate-200 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 hover:bg-slate-50">
            <TableHead className="text-right text-lg font-bold text-slate-800 py-4">משתמש</TableHead>
            <TableHead className="text-right text-lg font-bold text-slate-800 py-4">תפקיד</TableHead>
            <TableHead className="text-right text-lg font-bold text-slate-800 py-4">תאריך הצטרפות</TableHead>
            <TableHead className="text-right text-lg font-bold text-slate-800 py-4">פעולות</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} className="hover:bg-slate-50/50 transition-colors">
              <TableCell className="py-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 shadow-lg">
                    <AvatarFallback className="text-sm font-semibold bg-gradient-to-br from-primary/20 to-primary/10">
                      {getInitials(user.email, user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-right">
                    <div className="font-semibold text-lg text-slate-800">{user.name}</div>
                    <div className="text-base text-slate-600">{user.email}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="py-4">
                {getRoleBadge(user.role, user.isOwner)}
              </TableCell>
              <TableCell className="text-right py-4 text-lg text-slate-700">
                {new Date(user.joinedAt).toLocaleDateString('he-IL')}
              </TableCell>
              <TableCell className="py-4">
                {renderActions(user)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

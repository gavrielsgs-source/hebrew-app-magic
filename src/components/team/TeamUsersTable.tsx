import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Shield, Eye, DollarSign, Users, Crown, Trash2, Edit } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export type TeamUserRole = 'admin' | 'sales' | 'viewer' | 'accountant';

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
  sales: {
    label: 'מכירות',
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
  accountant: {
    label: 'רואה חשבון',
    icon: DollarSign,
    color: 'text-green-700',
    bgColor: 'bg-green-100'
  }
};

export function TeamUsersTable({ users, onEditUser, onDeleteUser, onChangeRole }: TeamUsersTableProps) {
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

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-right">משתמש</TableHead>
            <TableHead className="text-right">תפקיד</TableHead>
            <TableHead className="text-right">תאריך הצטרפות</TableHead>
            <TableHead className="text-right">פעולות</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {getInitials(user.email, user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-right">
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {getRoleBadge(user.role, user.isOwner)}
              </TableCell>
              <TableCell className="text-right">
                {new Date(user.joinedAt).toLocaleDateString('he-IL')}
              </TableCell>
              <TableCell>
                {!user.isOwner && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">פתח תפריט</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
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
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
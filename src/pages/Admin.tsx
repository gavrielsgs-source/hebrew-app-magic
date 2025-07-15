
import { useState } from "react";
import { useRealAgencies } from "@/hooks/use-real-agencies";
import { useRealUserManagement } from "@/hooks/use-real-user-management";
import { useRealAdminCheck } from "@/hooks/use-real-admin-check";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserRole } from "@/types/user";
import { toast } from "sonner";
import { ShieldAlert, UserCog, Building, Users } from "lucide-react";
import { Navigate } from "react-router-dom";

export default function Admin() {
  const { isAdmin, isLoading: adminLoading } = useRealAdminCheck();
  
  // אם טוען, מציג מסך טעינה
  if (adminLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl">בודק הרשאות...</p>
      </div>
    );
  }
  
  // אם המשתמש אינו אדמין, נעביר אותו לדף הראשי
  if (!isAdmin) {
    toast.error("אין לך הרשאות לדף זה");
    return <Navigate to="/" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ניהול מערכת</h1>
          <p className="text-muted-foreground">
            הגדרות מערכת, ניהול משתמשים והרשאות
          </p>
        </div>
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>משתמשים</span>
          </TabsTrigger>
          <TabsTrigger value="agencies" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            <span>סוכנויות</span>
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <UserCog className="h-4 w-4" />
            <span>הרשאות</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="space-y-4">
          <UsersTable />
        </TabsContent>
        
        <TabsContent value="agencies" className="space-y-4">
          <AgenciesManager />
        </TabsContent>
        
        <TabsContent value="permissions" className="space-y-4">
          <PermissionsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AgenciesManager() {
  const { agencies, isLoading, addAgency, updateAgency } = useRealAgencies();
  const [newAgencyName, setNewAgencyName] = useState("");
  const [editAgencyId, setEditAgencyId] = useState<string | null>(null);
  const [editAgencyName, setEditAgencyName] = useState("");

  const handleAddAgency = async () => {
    if (!newAgencyName.trim()) {
      toast.error("יש להזין שם סוכנות");
      return;
    }

    try {
      await addAgency.mutateAsync(newAgencyName);
      setNewAgencyName("");
    } catch (error) {
      console.error("Failed to add agency:", error);
    }
  };

  const handleUpdateAgency = async () => {
    if (!editAgencyId || !editAgencyName.trim()) {
      toast.error("שגיאה בעדכון סוכנות");
      return;
    }

    try {
      await updateAgency.mutateAsync({
        id: editAgencyId,
        name: editAgencyName
      });
      setEditAgencyId(null);
      setEditAgencyName("");
    } catch (error) {
      console.error("Failed to update agency:", error);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>הוספת סוכנות חדשה</CardTitle>
          <CardDescription>הוסף סוכנות חדשה למערכת</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="agency-name">שם הסוכנות</Label>
              <Input
                id="agency-name"
                placeholder="הזן שם סוכנות"
                value={newAgencyName}
                onChange={(e) => setNewAgencyName(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleAddAgency} disabled={!newAgencyName.trim() || addAgency.isPending}>
            {addAgency.isPending ? "מוסיף..." : "הוסף סוכנות"}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>סוכנויות קיימות</CardTitle>
          <CardDescription>ניהול סוכנויות במערכת</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">טוען...</div>
          ) : agencies.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">אין סוכנויות להצגה</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>שם סוכנות</TableHead>
                  <TableHead>תאריך יצירה</TableHead>
                  <TableHead>פעולות</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agencies.map((agency) => (
                  <TableRow key={agency.id}>
                    <TableCell className="font-medium">
                      {editAgencyId === agency.id ? (
                        <Input
                          value={editAgencyName}
                          onChange={(e) => setEditAgencyName(e.target.value)}
                          className="w-full"
                        />
                      ) : (
                        agency.name
                      )}
                    </TableCell>
                    <TableCell>{new Date(agency.created_at).toLocaleDateString('he-IL')}</TableCell>
                    <TableCell>
                      {editAgencyId === agency.id ? (
                        <div className="flex space-x-2 rtl:space-x-reverse">
                          <Button 
                            size="sm" 
                            onClick={handleUpdateAgency}
                            disabled={updateAgency.isPending}
                          >
                            שמור
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setEditAgencyId(null);
                              setEditAgencyName("");
                            }}
                          >
                            ביטול
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setEditAgencyId(agency.id);
                            setEditAgencyName(agency.name);
                          }}
                        >
                          ערוך
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}

function UsersTable() {
  const { allUsers, isLoading } = useRealUserManagement();

  return (
    <Card>
      <CardHeader>
        <CardTitle>משתמשי המערכת</CardTitle>
        <CardDescription>רשימת כל המשתמשים במערכת</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">טוען...</div>
        ) : allUsers.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">אין משתמשים להצגה</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>אימייל</TableHead>
                <TableHead>תאריך הרשמה</TableHead>
                <TableHead>התחברות אחרונה</TableHead>
                <TableHead>סטטוס אימות</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>{new Date(user.created_at).toLocaleDateString('he-IL')}</TableCell>
                  <TableCell>
                    {user.last_sign_in_at 
                      ? new Date(user.last_sign_in_at).toLocaleDateString('he-IL')
                      : 'לא התחבר עדיין'
                    }
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.email_confirmed_at 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.email_confirmed_at ? 'מאומת' : 'לא מאומת'}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function PermissionsManager() {
  const { agencies } = useRealAgencies();
  const { allUsers, userRoles, assignRole, removeRole, getUserRoles } = useRealUserManagement();
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("viewer");
  const [selectedAgencyId, setSelectedAgencyId] = useState<string>("");
  const [currentUserRoles, setCurrentUserRoles] = useState<any[]>([]);
  
  const handleUserSelect = async (userId: string) => {
    setSelectedUserId(userId);
    try {
      const roles = await getUserRoles(userId);
      setCurrentUserRoles(roles);
    } catch (error) {
      console.error("Failed to get user roles:", error);
      setCurrentUserRoles([]);
    }
  };
  
  const handleAssignRole = async () => {
    if (!selectedUserId || !selectedRole) {
      toast.error("יש לבחור משתמש ותפקיד");
      return;
    }
    
    try {
      await assignRole.mutateAsync({
        userId: selectedUserId,
        role: selectedRole,
        agencyId: selectedRole !== 'admin' ? selectedAgencyId : undefined
      });
      
      // רענון הרשאות
      const roles = await getUserRoles(selectedUserId);
      setCurrentUserRoles(roles);
    } catch (error) {
      console.error("Failed to assign role:", error);
    }
  };
  
  const handleRemoveRole = async (roleId: string) => {
    try {
      await removeRole.mutateAsync(roleId);
      
      // רענון הרשאות
      if (selectedUserId) {
        const roles = await getUserRoles(selectedUserId);
        setCurrentUserRoles(roles);
      }
    } catch (error) {
      console.error("Failed to remove role:", error);
    }
  };
  
  const roleLabels: Record<UserRole, string> = {
    'admin': 'מנהל מערכת',
    'agency_manager': 'מנהל סוכנות',
    'sales_agent': 'סוכן מכירות',
    'viewer': 'צפייה בלבד'
  };
  
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>הקצאת הרשאות</CardTitle>
          <CardDescription>הקצה תפקידים למשתמשים</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="user-select">בחר משתמש</Label>
              <Select 
                onValueChange={(value) => handleUserSelect(value)}
                value={selectedUserId}
              >
                <SelectTrigger id="user-select">
                  <SelectValue placeholder="בחר משתמש" />
                </SelectTrigger>
                <SelectContent>
                  {allUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedUserId && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="role-select">בחר תפקיד</Label>
                  <Select 
                    onValueChange={(value) => setSelectedRole(value as UserRole)}
                    value={selectedRole}
                  >
                    <SelectTrigger id="role-select">
                      <SelectValue placeholder="בחר תפקיד" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">מנהל מערכת</SelectItem>
                      <SelectItem value="agency_manager">מנהל סוכנות</SelectItem>
                      <SelectItem value="sales_agent">סוכן מכירות</SelectItem>
                      <SelectItem value="viewer">צפייה בלבד</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedRole !== 'admin' && (
                  <div className="grid gap-2">
                    <Label htmlFor="agency-select">בחר סוכנות</Label>
                    <Select 
                      onValueChange={setSelectedAgencyId}
                      value={selectedAgencyId}
                    >
                      <SelectTrigger id="agency-select">
                        <SelectValue placeholder="בחר סוכנות" />
                      </SelectTrigger>
                      <SelectContent>
                        {agencies.map((agency) => (
                          <SelectItem key={agency.id} value={agency.id}>
                            {agency.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <Button 
                  onClick={handleAssignRole}
                  disabled={!selectedUserId || !selectedRole || (selectedRole !== 'admin' && !selectedAgencyId) || assignRole.isPending}
                >
                  {assignRole.isPending ? "מוקצה..." : "הקצה תפקיד"}
                </Button>
                
                <div className="pt-4">
                  <Label>תפקידים נוכחיים</Label>
                  {currentUserRoles.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">אין תפקידים להצגה</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>תפקיד</TableHead>
                          <TableHead>סוכנות</TableHead>
                          <TableHead>פעולות</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentUserRoles.map((role) => (
                          <TableRow key={role.id}>
                            <TableCell>{roleLabels[role.role as UserRole] || role.role}</TableCell>
                            <TableCell>
                              {role.agency_id ? 
                                agencies.find(a => a.id === role.agency_id)?.name || role.agency_id 
                                : 'גלובלי'}
                            </TableCell>
                            <TableCell>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleRemoveRole(role.id)}
                                disabled={removeRole.isPending}
                              >
                                {removeRole.isPending ? "מוסר..." : "הסר"}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}

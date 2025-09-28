import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserPlus, Mail, Clock, CheckCircle, XCircle, Trash2, AlertCircle } from "lucide-react";
import { UserRole } from "@/types/user";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCompanies } from "@/hooks/use-companies";

const emailSchema = z.object({
  email: z.string().email("נא להזין כתובת אימייל תקינה")
});

export function AdminUserInvitations() {
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("sales_agent");
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const queryClient = useQueryClient();
  const { companies } = useCompanies();
  
  // Fetch all invitations (admin can see all)
  const { data: allInvitations = [], isLoading: invitationsLoading } = useQuery({
    queryKey: ["admin-invitations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_invitations")
        .select(`
          *,
          companies!inner(name)
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Get default agency for selected company
  const { data: defaultAgencyId } = useQuery({
    queryKey: ["default-agency", selectedCompanyId],
    queryFn: async () => {
      if (!selectedCompanyId) return null;
      
      const { data, error } = await supabase
        .from("agencies")
        .select("id")
        .eq("company_id", selectedCompanyId)
        .order("created_at", { ascending: true })
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching default agency:", error);
        return null;
      }
      return data;
    },
    enabled: !!selectedCompanyId,
  });

  // Cancel invitation mutation
  const cancelInvitation = useMutation({
    mutationFn: async (invitationId: string) => {
      const { error } = await supabase
        .from("user_invitations")
        .delete()
        .eq("id", invitationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-invitations"] });
      toast.success("ההזמנה בוטלה בהצלחה");
    },
    onError: (error: any) => {
      toast.error(error.message || "שגיאה בביטול ההזמנה");
    },
  });

  const handleSendInvitation = async () => {
    // Validate inputs
    try {
      emailSchema.parse({ email });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        return;
      }
    }

    if (!selectedCompanyId) {
      toast.error("יש לבחור חברה");
      return;
    }

    setIsLoading(true);
    
    try {
      const selectedCompany = companies.find(c => c.id === selectedCompanyId);
      
      // Build payload
      const payload: any = {
        email: email.trim(),
        role,
        companyId: selectedCompanyId,
        companyName: selectedCompany?.name || "חברה לא ידועה",
      };

      if (["agency_manager", "sales_agent", "viewer"].includes(role) && defaultAgencyId?.id) {
        payload.agencyId = defaultAgencyId.id;
      }

      const { error } = await supabase.functions.invoke('send-invitation', {
        body: payload,
      });

      if (error) throw error;

      // Reset form
      setEmail("");
      setRole("sales_agent");
      setSelectedCompanyId("");
      setIsInviteOpen(false);
      
      // Refresh invitations
      queryClient.invalidateQueries({ queryKey: ["admin-invitations"] });
      
      toast.success("ההזמנה נשלחה בהצלחה!");
    } catch (error: any) {
      console.error("Error sending invitation:", error);
      toast.error(error.message || "שגיאה בשליחת ההזמנה");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      await cancelInvitation.mutateAsync(invitationId);
    } catch (error) {
      console.error("Error canceling invitation:", error);
    }
  };

  const roleLabels: Record<UserRole, string> = {
    admin: "מנהל מערכת",
    company_owner: "בעלים של חברה",
    agency_manager: "מנהל סוכנות",
    sales_agent: "סוכן מכירות",
    viewer: "צפייה בלבד",
  };

  const getStatusBadge = (invitation: any) => {
    if (invitation.accepted_at) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-700">
          <CheckCircle className="h-3 w-3 mr-1" />
          התקבלה
        </Badge>
      );
    }

    const expiresAt = new Date(invitation.expires_at);
    const now = new Date();

    if (expiresAt < now) {
      return (
        <Badge variant="destructive">
          <XCircle className="h-3 w-3 mr-1" />
          פגה תוקף
        </Badge>
      );
    }

    return (
      <Badge variant="secondary">
        <Clock className="h-3 w-3 mr-1" />
        ממתינה
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-right">ניהול הזמנות משתמשים</CardTitle>
            <CardDescription className="text-right">
              שלח הזמנות למשתמשים חדשים לכל החברות במערכת
            </CardDescription>
          </div>
          
          <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <UserPlus className="h-4 w-4 mr-2" />
                שלח הזמנה
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]" dir="rtl">
              <DialogHeader>
                <DialogTitle>הזמנת משתמש חדש</DialogTitle>
                <DialogDescription>
                  הזמן משתמש חדש לאחת מהחברות במערכת
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="company">חברה</Label>
                  <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
                    <SelectTrigger>
                      <SelectValue placeholder="בחר חברה" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">כתובת אימייל</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="text-right"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">תפקיד</Label>
                  <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
                    <SelectTrigger>
                      <SelectValue placeholder="בחר תפקיד" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales_agent">סוכן מכירות</SelectItem>
                      <SelectItem value="agency_manager">מנהל סוכנות</SelectItem>
                      <SelectItem value="viewer">צפייה בלבד</SelectItem>
                      <SelectItem value="admin">מנהל מערכת</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsInviteOpen(false)}
                >
                  ביטול
                </Button>
                <Button
                  onClick={handleSendInvitation}
                  disabled={isLoading || !email.trim() || !selectedCompanyId}
                  className="bg-primary hover:bg-primary/90 disabled:opacity-50"
                >
                  {isLoading ? "שולח..." : "שלח הזמנה"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        {invitationsLoading ? (
          <div className="space-y-2">
            <div className="h-4 bg-muted animate-pulse rounded" />
            <div className="h-4 bg-muted animate-pulse rounded" />
            <div className="h-4 bg-muted animate-pulse rounded" />
          </div>
        ) : allInvitations.length === 0 ? (
          <div className="text-center py-8">
            <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              אין הזמנות עדיין
            </h3>
            <p className="text-muted-foreground mb-4">
              שלח הזמנה ראשונה למשתמש חדש
            </p>
            <Button
              onClick={() => setIsInviteOpen(true)}
              variant="outline"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              שלח הזמנה
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">אימייל</TableHead>
                <TableHead className="text-right">חברה</TableHead>
                <TableHead className="text-right">תפקיד</TableHead>
                <TableHead className="text-right">סטטוס</TableHead>
                <TableHead className="text-right">נשלח בתאריך</TableHead>
                <TableHead className="text-right">פעולות</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allInvitations.map((invitation) => (
                <TableRow key={invitation.id}>
                  <TableCell className="font-medium text-right">
                    {invitation.email}
                  </TableCell>
                  <TableCell className="text-right">
                    {(invitation as any).companies?.name || "לא ידוע"}
                  </TableCell>
                  <TableCell className="text-right">
                    {roleLabels[invitation.role]}
                  </TableCell>
                  <TableCell>{getStatusBadge(invitation)}</TableCell>
                  <TableCell className="text-right">
                    {new Date(invitation.created_at).toLocaleDateString('he-IL')}
                  </TableCell>
                  <TableCell>
                    {!invitation.accepted_at && new Date(invitation.expires_at) > new Date() && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCancelInvitation(invitation.id)}
                        disabled={cancelInvitation.isPending}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
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
  );
}
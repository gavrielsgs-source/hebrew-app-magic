import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserPlus, Mail, Clock, CheckCircle, XCircle, Trash2 } from "lucide-react";
import { useUserInvitations } from "@/hooks/use-user-invitations";
import { UserRole } from "@/types/user";
import { toast } from "sonner";

interface UserInvitationsProps {
  companyId: string;
}

export function UserInvitations({ companyId }: UserInvitationsProps) {
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("sales_agent");
  
  const { invitations, isLoading, sendInvitation, cancelInvitation } = useUserInvitations(companyId);

  const handleSendInvitation = async () => {
    if (!email.trim()) {
      toast.error("נא להזין כתובת אימייל");
      return;
    }

    if (!email.includes("@")) {
      toast.error("נא להזין כתובת אימייל תקינה");
      return;
    }

    try {
      await sendInvitation.mutateAsync({
        companyId,
        email: email.trim(),
        role,
      });
      setEmail("");
      setRole("sales_agent");
      setIsInviteOpen(false);
    } catch (error) {
      console.error("Error sending invitation:", error);
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
            <CardTitle className="text-right">הזמנות משתמשים</CardTitle>
            <CardDescription className="text-right">
              הזמן משתמשים חדשים לחברה שלך
            </CardDescription>
          </div>
          
          <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <UserPlus className="h-4 w-4 mr-2" />
                הזמן משתמש
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]" dir="rtl">
              <DialogHeader>
                <DialogTitle>הזמנת משתמש חדש</DialogTitle>
                <DialogDescription>
                  הזמן משתמש חדש לחברה שלך עם התפקיד המתאים
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
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
                  disabled={sendInvitation.isPending || !email.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {sendInvitation.isPending ? "שולח..." : "שלח הזמנה"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 animate-pulse rounded" />
            <div className="h-4 bg-gray-200 animate-pulse rounded" />
            <div className="h-4 bg-gray-200 animate-pulse rounded" />
          </div>
        ) : invitations.length === 0 ? (
          <div className="text-center py-8">
            <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              אין הזמנות עדיין
            </h3>
            <p className="text-gray-600 mb-4">
              הזמן את המשתמש הראשון שלך לחברה
            </p>
            <Button
              onClick={() => setIsInviteOpen(true)}
              variant="outline"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              הזמן משתמש
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">אימייל</TableHead>
                <TableHead className="text-right">תפקיד</TableHead>
                <TableHead className="text-right">סטטוס</TableHead>
                <TableHead className="text-right">נשלח בתאריך</TableHead>
                <TableHead className="text-right">פעולות</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invitations.map((invitation) => (
                <TableRow key={invitation.id}>
                  <TableCell className="font-medium text-right">
                    {invitation.email}
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
                        className="text-red-600 hover:text-red-700"
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
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Shield, Eye, DollarSign, Users, Copy, Check, Link } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import type { TeamUserRole } from "./TeamUsersTable";

interface AddTeamUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canAddMore: boolean;
  userLimit: number;
  currentUsage: number;
  onAddUser: (userData: { name: string; email: string; role: TeamUserRole }) => Promise<any>;
}

const addUserSchema = z.object({
  name: z.string().min(2, "השם חייב להכיל לפחות 2 תווים"),
  email: z.string().email("נא להזין כתובת אימייל תקינה"),
  role: z.enum(['admin', 'sales_agent', 'viewer', 'agency_manager'] as const, {
    required_error: "נא לבחור תפקיד"
  })
});

const roleOptions = [
  {
    value: 'admin' as const,
    label: 'מנהל מערכת',
    description: 'גישה מלאה לכל המערכת',
    icon: Shield,
    color: 'text-red-600'
  },
  {
    value: 'sales_agent' as const,
    label: 'איש מכירות',
    description: 'גישה למסמכים, לידים ולקוחות',
    icon: Users,
    color: 'text-blue-600'
  },
  {
    value: 'agency_manager' as const,
    label: 'מנהל סוכנות',
    description: 'גישה מלאה למסמכים והנהלת חשבונות',
    icon: DollarSign,
    color: 'text-green-600'
  },
  {
    value: 'viewer' as const,
    label: 'צפייה בלבד',
    description: 'צפייה בכל המסכים ללא יכולת עריכה',
    icon: Eye,
    color: 'text-gray-600'
  }
];

export function AddTeamUserDialog({ open, onOpenChange, canAddMore, userLimit, currentUsage, onAddUser }: AddTeamUserDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '' as TeamUserRole | ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async () => {
    try {
      // Validate form
      const validatedData = addUserSchema.parse(formData);
      
      if (!canAddMore) {
        toast.error(`הגעת למגבלת המשתמשים (${userLimit}). שדרג את המנוי להוספת משתמשים נוספים.`);
        return;
      }

      setIsLoading(true);
      setErrors({});

      const result = await onAddUser(validatedData as { name: string; email: string; role: TeamUserRole });
      
      // If email wasn't sent, show the invite link
      if (result && !result.emailSent && result.inviteUrl) {
        setInviteLink(result.inviteUrl);
      } else {
        // Email sent successfully - close dialog
        setFormData({ name: '', email: '', role: '' });
        setInviteLink(null);
        onOpenChange(false);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        toast.error("שגיאה בהוספת המשתמש. נסה שוב.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const selectedRoleConfig = roleOptions.find(r => r.value === formData.role);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>הוסף משתמש לצוות</DialogTitle>
          <DialogDescription>
            הזמן משתמש חדש לצוות שלך והגדר את רמת הגישה שלו
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Usage Alert */}
          {!canAddMore && (
            <Alert className="border-amber-200 bg-amber-50">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-700">
                הגעת למגבלת המשתמשים ({currentUsage}/{userLimit}). 
                שדרג את המנוי להוספת משתמשים נוספים.
              </AlertDescription>
            </Alert>
          )}

          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name">שם מלא</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="הזן שם מלא"
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">כתובת אימייל</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="user@example.com"
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>

          {/* Role Field */}
          <div className="space-y-2">
            <Label htmlFor="role">תפקיד</Label>
            <Select 
              value={formData.role} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, role: value as TeamUserRole }))}
            >
              <SelectTrigger className={errors.role ? "border-destructive" : ""}>
                <SelectValue placeholder="בחר תפקיד" />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2 w-full">
                        <Icon className={`h-4 w-4 ${option.color}`} />
                        <div className="text-right flex-1">
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-muted-foreground">{option.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-sm text-destructive">{errors.role}</p>
            )}
          </div>

          {/* Role Description */}
          {selectedRoleConfig && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <selectedRoleConfig.icon className={`h-4 w-4 ${selectedRoleConfig.color}`} />
                <span className="font-medium">{selectedRoleConfig.label}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {selectedRoleConfig.description}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            ביטול
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !canAddMore}
            className="bg-primary hover:bg-primary/90"
          >
            {isLoading ? "מוסיף..." : "הוסף משתמש"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
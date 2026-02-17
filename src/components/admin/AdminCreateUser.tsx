import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UserPlus, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const createUserSchema = z.object({
  email: z.string().email("נא להזין כתובת אימייל תקינה"),
  password: z.string().min(6, "הסיסמה חייבת להכיל לפחות 6 תווים"),
});

export function AdminCreateUser() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    try {
      createUserSchema.parse({ email, password });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        return;
      }
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "admin-create-user",
        {
          body: {
            email: email.trim(),
            password,
            fullName: fullName.trim() || undefined,
          },
        }
      );

      if (error) {
        const ctx = (error as any).context || {};
        const serverMsg = ctx.error || ctx.message || error.message;
        throw new Error(serverMsg || "שגיאה ביצירת המשתמש");
      }

      toast.success(`המשתמש ${email} נוצר בהצלחה עם ניסיון ל-14 ימים!`);
      setEmail("");
      setPassword("");
      setFullName("");
      setIsOpen(false);
    } catch (error: any) {
      console.error("Error creating user:", error);
      toast.error(error.message || "שגיאה ביצירת המשתמש");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <UserPlus className="h-4 w-4 mr-2" />
          צור משתמש
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>יצירת משתמש חדש</DialogTitle>
          <DialogDescription>
            צור משתמש חדש עם אימייל וסיסמה. המשתמש יקבל אוטומטית 14 ימי ניסיון.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="create-email">כתובת אימייל</Label>
            <Input
              id="create-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="text-right"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-password">סיסמה</Label>
            <div className="relative">
              <Input
                id="create-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="לפחות 6 תווים"
                className="text-right pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-fullname">שם מלא (אופציונלי)</Label>
            <Input
              id="create-fullname"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="שם פרטי ומשפחה"
              className="text-right"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            ביטול
          </Button>
          <Button
            onClick={handleCreate}
            disabled={isLoading || !email.trim() || !password}
            className="bg-primary hover:bg-primary/90 disabled:opacity-50"
          >
            {isLoading ? "יוצר..." : "צור משתמש"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

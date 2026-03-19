import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { z } from "zod";

const passwordSchema = z.object({
  password: z.string().min(6, "הסיסמה חייבת להכיל לפחות 6 תווים"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "הסיסמאות אינן תואמות",
  path: ["confirmPassword"]
});

interface InvitationData {
  id: string;
  email: string;
  role: string;
  company_id: string;
  agency_id?: string;
  expires_at: string;
  companies: {
    name: string;
  };
}

export default function AcceptInvitation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const token = searchParams.get("token");

  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const roleNames: Record<string, string> = {
    'viewer': 'צפייה בלבד',
    'sales_agent': 'איש מכירות',
    'agency_manager': 'מנהל סוכנות',
    'admin': 'מנהל מערכת'
  };

  useEffect(() => {
    if (!token) {
      setError("קישור הזמנה לא תקין");
      setLoading(false);
      return;
    }

    fetchInvitation();
  }, [token]);

  const fetchInvitation = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('accept-invitation', {
        body: {
          action: 'info',
          token: token
        }
      });

      if (error || !data) {
        setError(error?.message || "הזמנה לא נמצאה או שפגה תוקפה");
        return;
      }

      setInvitation({
        id: '',
        email: data.email,
        role: data.role,
        company_id: '',
        agency_id: '',
        expires_at: data.expiresAt,
        companies: {
          name: data.companyName
        }
      });
    } catch (err) {
      console.error("Error fetching invitation:", err);
      setError("שגיאה בטעינת ההזמנה");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvitation = async () => {
    if (!invitation) return;

    // Validate password if user needs to sign up
    if (!user) {
      try {
        passwordSchema.parse({ password, confirmPassword });
      } catch (validationError) {
        if (validationError instanceof z.ZodError) {
          setError(validationError.errors[0].message);
          return;
        }
      }
    }

    setIsAccepting(true);
    setError("");

    try {
      // Call the edge function - it handles user creation via admin API
      const { data: acceptData, error: acceptError } = await supabase.functions.invoke('accept-invitation', {
        body: {
          action: 'accept',
          token: token,
          email: invitation.email,
          password: !user ? password : undefined,
        }
      });

      if (acceptError) {
        throw new Error(acceptError.message || "שגיאה בקבלת ההזמנה");
      }

      if (!acceptData?.success) {
        throw new Error(acceptData?.error || "שגיאה בקבלת ההזמנה");
      }

      toast.success(acceptData.message || "התצטרפת בהצלחה לחברה!");

      // If user was created by admin API (no session), sign them in
      if (acceptData.needsLogin && !user) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: invitation.email,
          password: password,
        });

        if (signInError) {
          toast.info("החשבון נוצר בהצלחה! אנא התחבר עם הסיסמה שהגדרת.");
          navigate("/auth");
          return;
        }
      }

      navigate("/");
    } catch (err: any) {
      console.error("Error accepting invitation:", err);
      setError(err.message || "שגיאה בקבלת ההזמנה");
    } finally {
      setIsAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">טוען הזמנה...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && !invitation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <Alert className="mb-4 border-red-200 bg-red-50">
              <AlertDescription className="text-red-700 text-right">
                {error}
              </AlertDescription>
            </Alert>
            <Button
              onClick={() => navigate("/")}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              חזור לעמוד הבית
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4" dir="rtl">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
          <CardTitle className="text-2xl font-bold">🎉 הזמנה מיוחדת!</CardTitle>
          <CardDescription className="text-purple-100">
            הוזמנת להצטרף לחברת {invitation?.companies.name}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          {invitation && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">אימייל:</span>
                <span className="text-gray-900">{invitation.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">תפקיד:</span>
                <span className="text-purple-600 font-medium">
                  {roleNames[invitation.role] || invitation.role}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">חברה:</span>
                <span className="text-gray-900">{invitation.companies.name}</span>
              </div>
            </div>
          )}

          {!user && (
            <div className="space-y-4">
              <div className="text-center text-sm text-gray-600 mb-4">
                כדי להצטרף, הגדר סיסמה עבור החשבון שלך
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">סיסמה</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="הכנס סיסמה (לפחות 6 תווים)"
                  className="text-right"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">אישור סיסמה</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="הכנס סיסמה שוב"
                  className="text-right"
                />
              </div>
            </div>
          )}

          {user && (
            <Alert className="border-green-200 bg-green-50">
              <AlertDescription className="text-green-700 text-right">
                אתה כבר מחובר כ-{user.email}
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-700 text-right">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <Button
              onClick={handleAcceptInvitation}
              disabled={isAccepting || (!user && (!password || !confirmPassword))}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 h-12 text-lg font-semibold"
            >
              {isAccepting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  מצטרף...
                </div>
              ) : (
                "🚀 קבל הזמנה והצטרף"
              )}
            </Button>
            
            <Button
              variant="outline" 
              onClick={() => navigate("/")}
              className="w-full"
            >
              ביטול
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

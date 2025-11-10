import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Lock } from 'lucide-react';
import { PasswordStrengthMeter } from '@/components/auth/PasswordStrengthMeter';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if we have a valid session from the reset link
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        toast({
          variant: "destructive",
          title: "קישור לא תקין",
          description: "הקישור לאיפוס סיסמה פג תוקפו או לא תקין",
        });
        navigate('/forgot-password');
      }
    });
  }, [navigate, toast]);

  const validatePassword = () => {
    if (password.length < 8) {
      setError('הסיסמה חייבת להכיל לפחות 8 תווים');
      return false;
    }
    if (!/[A-Z]/.test(password)) {
      setError('הסיסמה חייבת להכיל לפחות אות גדולה אחת');
      return false;
    }
    if (!/[a-z]/.test(password)) {
      setError('הסיסמה חייבת להכיל לפחות אות קטנה אחת');
      return false;
    }
    if (!/[0-9]/.test(password)) {
      setError('הסיסמה חייבת להכיל לפחות ספרה אחת');
      return false;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      setError('הסיסמה חייבת להכיל לפחות תו מיוחד אחד');
      return false;
    }
    if (password !== confirmPassword) {
      setError('הסיסמאות אינן תואמות');
      return false;
    }
    setError('');
    return true;
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePassword()) {
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      toast({
        title: "הסיסמה עודכנה בהצלחה",
        description: "כעת תוכל להתחבר עם הסיסמה החדשה",
      });

      navigate('/login');
    } catch (error: any) {
      console.error('Error resetting password:', error);
      setError(error.message || 'אירעה שגיאה באיפוס הסיסמה');
      toast({
        variant: "destructive",
        title: "שגיאה באיפוס סיסמה",
        description: error.message || 'אירעה שגיאה באיפוס הסיסמה',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground">הגדר סיסמה חדשה</h2>
          <p className="mt-2 text-muted-foreground">
            בחר סיסמה חזקה שתזכור
          </p>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-700 font-medium">
              סיסמה חדשה
            </Label>
            <div className="relative">
              <Lock className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                id="password"
                type="password"
                placeholder="בחר סיסמה חזקה"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-12 h-12 border-gray-200 rounded-xl"
                required
              />
            </div>
          </div>

          <PasswordStrengthMeter password={password} />

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
              אימות סיסמה
            </Label>
            <div className="relative">
              <Lock className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                id="confirmPassword"
                type="password"
                placeholder="הזן את הסיסמה שוב"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pr-12 h-12 border-gray-200 rounded-xl"
                required
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-12 bg-brand-primary hover:bg-brand-primary/90 rounded-xl text-white font-medium shadow-lg hover:shadow-xl transition-all"
            disabled={loading}
          >
            {loading ? 'מעדכן...' : 'עדכן סיסמה'}
          </Button>
        </form>
      </div>
    </div>
  );
}

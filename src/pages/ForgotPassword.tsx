import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Mail, ArrowRight } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/reset-password`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) throw error;

      setSubmitted(true);
      toast({
        title: "קישור נשלח בהצלחה",
        description: "בדוק את תיבת הדואר האלקטרוני שלך לקבלת קישור לאיפוס סיסמה",
      });
    } catch (error: any) {
      console.error('Error sending reset email:', error);
      toast({
        variant: "destructive",
        title: "שגיאה בשליחת הקישור",
        description: error.message || 'אירעה שגיאה בשליחת הקישור',
      });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
        <div className="w-full max-w-md space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto">
              <Mail className="h-8 w-8 text-success" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">בדוק את האימייל שלך</h2>
            <p className="text-muted-foreground">
              שלחנו קישור לאיפוס סיסמה לכתובת: <strong>{email}</strong>
            </p>
            <p className="text-sm text-muted-foreground">
              לא קיבלת את האימייל? בדוק בתיקיית הספאם או נסה שוב
            </p>
          </div>

          <div className="space-y-4">
            <Button
              onClick={() => setSubmitted(false)}
              variant="outline"
              className="w-full"
            >
              שלח שוב
            </Button>
            <Link to="/login">
              <Button variant="ghost" className="w-full">
                חזרה להתחברות
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground">שכחת סיסמה?</h2>
          <p className="mt-2 text-muted-foreground">
            אין בעיה! נשלח לך קישור לאיפוס הסיסמה
          </p>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700 font-medium">
              כתובת אימייל
            </Label>
            <div className="relative">
              <Mail className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pr-12 h-12 border-gray-200 rounded-xl"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-brand-primary hover:bg-brand-primary/90 rounded-xl text-white font-medium shadow-lg hover:shadow-xl transition-all"
            disabled={loading}
          >
            {loading ? 'שולח...' : 'שלח קישור לאיפוס סיסמה'}
          </Button>
        </form>

        <div className="text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm text-brand-primary hover:text-brand-secondary transition-colors"
          >
            <ArrowRight className="h-4 w-4" />
            חזרה להתחברות
          </Link>
        </div>
      </div>
    </div>
  );
}


import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Mail, Lock, UserPlus } from 'lucide-react';

export default function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    // בדיקת חוזק סיסמה בסיסית
    if (password.length < 6) {
      setErrorMsg('הסיסמה חייבת להכיל לפחות 6 תווים');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "נרשמת בהצלחה",
        description: "אם דרוש אישור אימייל, אנא בדוק את תיבת הדואר שלך.",
      });
      
      // ניווט לדף ההתחברות אחרי הרשמה מוצלחת
      navigate('/auth', { state: { registered: true } });
    } catch (error: any) {
      console.error('Error registering:', error);
      
      if (error.message.includes('already registered')) {
        setErrorMsg('האימייל כבר רשום במערכת');
      } else {
        setErrorMsg(error.message || 'אירעה שגיאה בהרשמה');
      }
      
      toast({
        variant: "destructive",
        title: "שגיאה בהרשמה",
        description: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleRegister} className="space-y-6 w-full max-w-sm mx-auto">
      <div className="space-y-2">
        <Label htmlFor="email">אימייל</Label>
        <div className="relative">
          <Mail className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pr-10"
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">סיסמה</Label>
        <div className="relative">
          <Lock className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pr-10"
            required
          />
        </div>
        <p className="text-xs text-gray-500">הסיסמה חייבת להכיל לפחות 6 תווים</p>
      </div>

      {errorMsg && (
        <div className="text-red-500 text-sm">{errorMsg}</div>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'יוצר חשבון...' : 'הרשמה'}
      </Button>
    </form>
  );
}

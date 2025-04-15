
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Mail, Lock } from 'lucide-react';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "התחברת בהצלחה",
        description: "ברוך הבא למערכת",
      });
      
      // לאחר התחברות מוצלחת, מפנה למסך הראשי
      navigate('/');
    } catch (error: any) {
      console.error('Error logging in:', error);
      
      // מטפל בסוגי שגיאות שונים
      if (error.message.includes('Invalid login credentials')) {
        setErrorMsg('פרטי התחברות שגויים');
      } else if (error.message.includes('Email not confirmed')) {
        setErrorMsg('נא לאשר את האימייל שלך לפני ההתחברות');
      } else {
        setErrorMsg(error.message || 'אירעה שגיאה בהתחברות');
      }
      
      toast({
        variant: "destructive",
        title: "שגיאה בהתחברות",
        description: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-6 w-full max-w-sm mx-auto">
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
      </div>

      {errorMsg && (
        <div className="text-red-500 text-sm">{errorMsg}</div>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'מתחבר...' : 'התחבר'}
      </Button>
    </form>
  );
}

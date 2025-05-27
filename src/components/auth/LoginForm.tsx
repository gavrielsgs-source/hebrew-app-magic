
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
      
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error logging in:', error);
      
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
    <form onSubmit={handleLogin} className="space-y-6 w-full">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-gray-700 font-medium">אימייל</Label>
        <div className="relative">
          <Mail className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pr-12 h-12 border-gray-200 rounded-xl focus:border-[#2F3C7E] focus:ring-[#2F3C7E]"
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password" className="text-gray-700 font-medium">סיסמה</Label>
        <div className="relative">
          <Lock className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            id="password"
            type="password"
            placeholder="הכנס את הסיסמה שלך"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pr-12 h-12 border-gray-200 rounded-xl focus:border-[#2F3C7E] focus:ring-[#2F3C7E]"
            required
          />
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-600 text-sm">{errorMsg}</p>
        </div>
      )}

      <Button 
        type="submit" 
        className="w-full h-12 bg-gradient-to-r from-[#2F3C7E] to-[#4CAF50] hover:from-[#1A2347] hover:to-[#45A049] rounded-xl text-white font-medium shadow-lg hover:shadow-xl transition-all" 
        disabled={loading}
      >
        {loading ? 'מתחבר...' : 'התחבר למערכת'}
      </Button>
    </form>
  );
}

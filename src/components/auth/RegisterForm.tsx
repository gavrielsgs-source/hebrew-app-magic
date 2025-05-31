
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Mail, Lock, UserPlus } from 'lucide-react';
import { GoogleAuthButton } from './GoogleAuthButton';

export default function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

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

      // Store remember me preference
      if (rememberMe) {
        localStorage.setItem('carslead_remember_device', 'true');
      }

      toast({
        title: "נרשמת בהצלחה!",
        description: "אם דרוש אישור אימייל, אנא בדוק את תיבת הדואר שלך.",
      });
      
      navigate('/dashboard');
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
    <div className="space-y-6 w-full">
      {/* Google Login Button */}
      <GoogleAuthButton mode="signup" />
      
      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-4 text-gray-500">או</span>
        </div>
      </div>

      {/* Email/Password Form */}
      <form onSubmit={handleRegister} className="space-y-6 w-full">
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
              className="pr-12 h-12 border-gray-200 rounded-xl focus:border-carslead-purple focus:ring-carslead-purple"
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
              placeholder="בחר סיסמה חזקה"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pr-12 h-12 border-gray-200 rounded-xl focus:border-carslead-purple focus:ring-carslead-purple"
              required
            />
          </div>
          <p className="text-xs text-gray-500 mr-1">הסיסמה חייבת להכיל לפחות 6 תווים</p>
        </div>

        {/* Remember Me Checkbox */}
        <div className="flex items-center space-x-2 space-x-reverse">
          <input
            id="remember"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 text-carslead-purple focus:ring-carslead-purple border-gray-300 rounded"
          />
          <Label htmlFor="remember" className="text-sm text-gray-600">
            זכור אותי במכשיר זה
          </Label>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-600 text-sm">{errorMsg}</p>
          </div>
        )}

        <Button 
          type="submit" 
          className="w-full h-12 bg-gradient-to-r from-carslead-purple to-carslead-blue hover:from-carslead-purple/90 hover:to-carslead-blue/90 rounded-xl text-white font-medium shadow-lg hover:shadow-xl transition-all" 
          disabled={loading}
        >
          <UserPlus className="ml-2 h-5 w-5" />
          {loading ? 'יוצר חשבון...' : 'הירשם עכשיו'}
        </Button>
      </form>
    </div>
  );
}

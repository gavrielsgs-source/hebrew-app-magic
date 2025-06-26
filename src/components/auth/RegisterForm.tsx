
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Mail, Lock, User } from 'lucide-react';
import { GoogleAuthButton } from './GoogleAuthButton';

interface RegisterFormProps {
  isTrialIntent?: boolean;
}

export default function RegisterForm({ isTrialIntent = false }: RegisterFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const redirectUrl = isTrialIntent 
        ? `${window.location.origin}/welcome`
        : `${window.location.origin}/dashboard`;

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
            trial_intent: isTrialIntent
          }
        }
      });

      if (error) throw error;

      toast({
        title: isTrialIntent ? "ברוך הבא לניסיון החינם!" : "נרשמת בהצלחה",
        description: isTrialIntent 
          ? "החשבון שלך נוצר והניסיון החינם התחל" 
          : "נא לבדוק את האימייל שלך לאישור החשבון",
      });

      // If email confirmation is disabled, redirect immediately
      if (isTrialIntent) {
        navigate('/welcome');
      } else {
        navigate('/dashboard');
      }
      
    } catch (error: any) {
      console.error('Error registering:', error);
      
      if (error.message.includes('User already registered')) {
        setErrorMsg('משתמש עם האימייל הזה כבר קיים');
      } else if (error.message.includes('Password should be at least')) {
        setErrorMsg('הסיסמה חייבת להכיל לפחות 6 תווים');
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
      {/* Google Registration Button */}
      <GoogleAuthButton mode="register" />
      
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
          <Label htmlFor="fullName" className="text-gray-700 font-medium">שם מלא</Label>
          <div className="relative">
            <User className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              id="fullName"
              type="text"
              placeholder="השם המלא שלך"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="pr-12 h-12 border-gray-200 rounded-xl focus:border-carslead-purple focus:ring-carslead-purple"
              required
            />
          </div>
        </div>
        
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
              placeholder="בחר סיסמה חזקה (לפחות 6 תווים)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pr-12 h-12 border-gray-200 rounded-xl focus:border-carslead-purple focus:ring-carslead-purple"
              required
              minLength={6}
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
          className="w-full h-12 bg-gradient-to-r from-carslead-purple to-carslead-blue hover:from-carslead-purple/90 hover:to-carslead-blue/90 rounded-xl text-white font-medium shadow-lg hover:shadow-xl transition-all" 
          disabled={loading}
        >
          {loading ? 'נרשם...' : isTrialIntent ? 'התחל ניסיון חינם' : 'הירשם למערכת'}
        </Button>
      </form>
    </div>
  );
}

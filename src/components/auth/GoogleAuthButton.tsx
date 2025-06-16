
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface GoogleAuthButtonProps {
  mode: 'login' | 'signup';
}

export function GoogleAuthButton({ mode }: GoogleAuthButtonProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleGoogleAuth = async () => {
    setLoading(true);
    
    try {
      // Get the current origin dynamically
      const currentOrigin = window.location.origin;
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${currentOrigin}/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      });

      if (error) {
        console.error('Google OAuth error:', error);
        
        // Show user-friendly error message
        if (error.message.includes('connection refused') || error.message.includes('ERR_CONNECTION_REFUSED')) {
          toast({
            variant: "destructive",
            title: "שגיאת תצורה",
            description: "יש בעיה בהגדרות Google OAuth. אנא פנה למנהל המערכת או נסה להתחבר עם אימייל וסיסמה.",
          });
        } else {
          toast({
            variant: "destructive",
            title: "שגיאה בהתחברות Google",
            description: error.message || 'אירעה שגיאה בהתחברות',
          });
        }
        
        throw error;
      }

      toast({
        title: "מתחבר דרך Google...",
        description: "אנא המתן לכמה רגעים",
      });
    } catch (error: any) {
      console.error('Error with Google auth:', error);
      // Error handling is done above
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleGoogleAuth}
      disabled={loading}
      className="w-full h-12 border-2 border-gray-200 hover:border-gray-300 rounded-xl text-gray-700 font-medium transition-all"
    >
      <div className="flex items-center justify-center gap-3">
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        <span>
          {loading ? 'מתחבר...' : mode === 'login' ? 'התחבר עם Google' : 'הירשם עם Google'}
        </span>
      </div>
    </Button>
  );
}

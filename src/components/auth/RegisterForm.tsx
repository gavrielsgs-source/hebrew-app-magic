
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Mail, Lock, User, Building, Phone, MapPin } from 'lucide-react';
import { GoogleAuthButton } from './GoogleAuthButton';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';

interface RegisterFormProps {
  isTrialIntent?: boolean;
}

export default function RegisterForm({ isTrialIntent = false }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    companyName: '',
    businessId: '',
    address: '',
    city: '',
    postalCode: '',
    phone: '',
    email: '',
    password: '',
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    if (!acceptTerms) {
      setErrorMsg('חובה לאשר את תנאי השימוש ומדיניות הפרטיות');
      setLoading(false);
      return;
    }

    // Check for duplicate phone
    try {
      const { data: phoneExists } = await supabase.rpc('check_phone_exists', {
        phone_number: formData.phone
      });

      if (phoneExists) {
        setErrorMsg('מספר הטלפון כבר קיים במערכת');
        setLoading(false);
        return;
      }
    } catch (error) {
      console.error('Error checking phone:', error);
    }

    try {
      const redirectUrl = isTrialIntent 
        ? `${window.location.origin}/payment`
        : `${window.location.origin}/dashboard`;

      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: `${formData.firstName} ${formData.lastName}`,
            first_name: formData.firstName,
            last_name: formData.lastName,
            company_name: formData.companyName,
            business_id: formData.businessId,
            address: formData.address,
            city: formData.city,
            postal_code: formData.postalCode,
            phone: formData.phone,
            trial_intent: isTrialIntent
          }
        }
      });

      if (error) throw error;

      // Get the newly created user
      const { data: { user: newUser } } = await supabase.auth.getUser();
      
      if (newUser) {
        // Create trial subscription automatically
        console.log('Creating trial subscription for new user:', newUser.id);
        
        try {
          const { error: trialError } = await supabase.functions.invoke('create-trial-subscription', {
            body: {
              userId: newUser.id,
              email: formData.email
            }
          });

          if (trialError) {
            console.error('Error creating trial subscription:', trialError);
            // Don't throw - user is registered, subscription issue is non-critical
          } else {
            console.log('✅ Trial subscription created successfully');
          }
        } catch (subError) {
          console.error('Error in trial subscription flow:', subError);
          // Continue - user registration was successful
        }

        // Send welcome email with magic link
        try {
          const { error: emailError } = await supabase.functions.invoke('send-email', {
            body: {
              to: formData.email,
              template: 'welcome',
              data: {
                userName: `${formData.firstName} ${formData.lastName}`,
                magicLink: `${window.location.origin}/auth/callback`,
                trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('he-IL'),
                amount: 0
              }
            }
          });

          if (emailError) {
            console.error('Error sending welcome email:', emailError);
          } else {
            console.log('✅ Welcome email sent successfully to:', formData.email);
          }
        } catch (emailErr) {
          console.error('Error in welcome email flow:', emailErr);
        }
      }

      toast({
        title: isTrialIntent ? "ברוך הבא לניסיון החינם!" : "נרשמת בהצלחה",
        description: isTrialIntent 
          ? "עכשיו בחר את התוכנית המתאימה לך" 
          : "החשבון שלך נוצר בהצלחה עם 14 ימי ניסיון חינם",
      });

      if (isTrialIntent) {
        // Get selected plan from URL if exists
        const urlParams = new URLSearchParams(window.location.search);
        const selectedPlan = urlParams.get('plan');
        navigate(selectedPlan ? `/payment?plan=${selectedPlan}` : '/payment');
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

      {/* Registration Form */}
      <form onSubmit={handleRegister} className="space-y-4 w-full">
        {/* Personal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-gray-700 font-medium">שם פרטי</Label>
            <div className="relative">
              <User className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                id="firstName"
                type="text"
                placeholder="שם פרטי"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className="pr-12 h-12 border-gray-200 rounded-xl focus:border-carslead-purple focus:ring-carslead-purple"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-gray-700 font-medium">שם משפחה</Label>
            <div className="relative">
              <User className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                id="lastName"
                type="text"
                placeholder="שם משפחה"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className="pr-12 h-12 border-gray-200 rounded-xl focus:border-carslead-purple focus:ring-carslead-purple"
                required
              />
            </div>
          </div>
        </div>

        {/* Company Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="companyName" className="text-gray-700 font-medium">שם החברה</Label>
            <div className="relative">
              <Building className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                id="companyName"
                type="text"
                placeholder="שם החברה"
                value={formData.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                className="pr-12 h-12 border-gray-200 rounded-xl focus:border-carslead-purple focus:ring-carslead-purple"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessId" className="text-gray-700 font-medium">ח.פ / ע.מ</Label>
            <Input
              id="businessId"
              type="text"
              placeholder="מספר עוסק מורשה או ח.פ"
              value={formData.businessId}
              onChange={(e) => handleInputChange('businessId', e.target.value)}
              className="h-12 border-gray-200 rounded-xl focus:border-carslead-purple focus:ring-carslead-purple"
              required
            />
          </div>
        </div>

        {/* Address Information */}
        <div className="space-y-2">
          <Label htmlFor="address" className="text-gray-700 font-medium">כתובת</Label>
          <div className="relative">
            <MapPin className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              id="address"
              type="text"
              placeholder="כתובת מלאה"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className="pr-12 h-12 border-gray-200 rounded-xl focus:border-carslead-purple focus:ring-carslead-purple"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city" className="text-gray-700 font-medium">עיר</Label>
            <Input
              id="city"
              type="text"
              placeholder="עיר"
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              className="h-12 border-gray-200 rounded-xl focus:border-carslead-purple focus:ring-carslead-purple"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="postalCode" className="text-gray-700 font-medium">מיקוד</Label>
            <Input
              id="postalCode"
              type="text"
              placeholder="מיקוד"
              value={formData.postalCode}
              onChange={(e) => handleInputChange('postalCode', e.target.value)}
              className="h-12 border-gray-200 rounded-xl focus:border-carslead-purple focus:ring-carslead-purple"
              required
            />
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-gray-700 font-medium">טלפון סלולרי</Label>
          <div className="relative">
            <Phone className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              id="phone"
              type="tel"
              placeholder="050-1234567"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="pr-12 h-12 border-gray-200 rounded-xl focus:border-carslead-purple focus:ring-carslead-purple"
              required
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-700 font-medium">דואר אלקטרוני</Label>
          <div className="relative">
            <Mail className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
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
              placeholder="בחר סיסמה חזקה (לפחות 8 תווים)"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className="pr-12 h-12 border-gray-200 rounded-xl"
              required
              minLength={8}
            />
          </div>
        </div>

        <PasswordStrengthMeter password={formData.password} />

        {/* Terms and Conditions */}
        <div className="flex items-start space-x-2 space-x-reverse pt-4">
          <Checkbox 
            id="accept-terms" 
            checked={acceptTerms}
            onCheckedChange={(checked) => setAcceptTerms(checked === true)}
          />
          <label 
            htmlFor="accept-terms" 
            className="text-sm text-gray-600 leading-relaxed cursor-pointer"
          >
            אני מאשר את{' '}
            <a 
              href="/terms-of-service" 
              target="_blank"
              className="text-brand-primary hover:text-brand-secondary underline"
            >
              תנאי השימוש
            </a>
            {' '}ו
            <a 
              href="/privacy-policy" 
              target="_blank"
              className="text-brand-primary hover:text-brand-secondary underline"
            >
              מדיניות הפרטיות
            </a>
          </label>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-600 text-sm">{errorMsg}</p>
          </div>
        )}

        <Button 
          type="submit" 
          className="w-full h-12 bg-brand-primary hover:bg-brand-primary/90 rounded-xl text-white font-medium shadow-lg hover:shadow-xl transition-all" 
          disabled={loading}
        >
          {loading ? 'נרשם...' : isTrialIntent ? 'התחל ניסיון חינם' : 'הירשם למערכת'}
        </Button>
      </form>
    </div>
  );
}

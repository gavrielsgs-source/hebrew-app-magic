import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Mail, Lock, User, Building, Phone, MapPin, CheckCircle2, Zap } from 'lucide-react';
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton';

const plans = [
  {
    id: 'premium',
    name: 'פרימיום',
    monthlyPrice: 199,
    yearlyPrice: 179,
    description: 'מתאים לעסק קטן',
    features: [
      'עד 20 רכבים',
      'עד 50 לידים',
      'עד 2 משתמשים',
      '5 תבניות וואטסאפ',
      '100 הודעות וואטסאפ לחודש',
      'משימות ללא הגבלה',
      'דשבורד בסיסי',
      'תמיכה בוואטסאפ'
    ]
  },
  {
    id: 'business',
    name: 'ביזנס',
    monthlyPrice: 399,
    yearlyPrice: 349,
    description: 'מתאים לעסק בינוני',
    popular: true,
    features: [
      'עד 50 רכבים',
      'עד 200 לידים',
      'עד 5 משתמשים',
      '10 תבניות וואטסאפ',
      '500 הודעות וואטסאפ לחודש',
      'משימות ללא הגבלה',
      'דשבורד מתקדם',
      'אנליטיקה מלאה',
      'תמיכה מועדפת'
    ]
  },
  {
    id: 'enterprise',
    name: 'אנטרפרייז',
    monthlyPrice: 699,
    yearlyPrice: 619,
    description: 'מתאים למגרש גדול',
    features: [
      'ללא הגבלה על רכבים ולידים',
      'עד 10 משתמשים',
      'תבניות וואטסאפ ללא הגבלה',
      '2000 הודעות וואטסאפ לחודש',
      'משימות ללא הגבלה',
      'אנליטיקה מותאמת אישית',
      'API מלא',
      'תמיכה VIP',
      'הדרכה אישית'
    ]
  }
];

export default function TrialSignup() {
  const [searchParams] = useSearchParams();
  const preselectedPlan = searchParams.get('plan') || 'business';
  
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
  const [selectedPlan, setSelectedPlan] = useState(preselectedPlan);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getSelectedPlanPrice = () => {
    const plan = plans.find(p => p.id === selectedPlan);
    if (!plan) return 0;
    return billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
  };

  const calculateDiscount = () => {
    const plan = plans.find(p => p.id === selectedPlan);
    if (!plan) return 0;
    const monthlyTotal = plan.monthlyPrice * 12;
    const yearlyTotal = plan.yearlyPrice * 12;
    return Math.round(((monthlyTotal - yearlyTotal) / monthlyTotal) * 100);
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

    try {
      const redirectUrl = `${window.location.origin}/payment?plan=${selectedPlan}&cycle=${billingCycle}`;

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
            trial_intent: true,
            selected_plan: selectedPlan,
            billing_cycle: billingCycle
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
          } else {
            console.log('✅ Trial subscription created successfully');
          }
        } catch (subError) {
          console.error('Error in trial subscription flow:', subError);
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
        title: "ברוך הבא לניסיון החינם!",
        description: "עכשיו בחר את אמצעי התשלום שלך",
      });

      navigate(`/payment?plan=${selectedPlan}&cycle=${billingCycle}`);
      
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 rounded-full px-4 py-2 mb-4">
            <Zap className="h-4 w-4" />
            <span className="font-bold">14 ימי ניסיון חינם</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            התחל את תקופת הניסיון שלך
          </h1>
          <p className="text-lg text-gray-600">
            גישה מלאה לכל התכונות • ללא חיוב בתקופת הניסיון • ניתן לבטל בכל עת
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Right Side - Plan Selection */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4">בחר את החבילה המתאימה</h2>
              
              {/* Billing Cycle Toggle */}
              <div className="flex items-center justify-center gap-4 mb-6 p-3 bg-gray-50 rounded-lg">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    billingCycle === 'monthly'
                      ? 'bg-gradient-to-r from-carslead-purple to-carslead-blue text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  חודשי
                </button>
                <button
                  onClick={() => setBillingCycle('yearly')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    billingCycle === 'yearly'
                      ? 'bg-gradient-to-r from-carslead-purple to-carslead-blue text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  שנתי <span className="text-xs">(חסוך {calculateDiscount()}%)</span>
                </button>
              </div>

              {/* Plans */}
              <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan} className="space-y-3">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all ${
                      selectedPlan === plan.id
                        ? 'border-carslead-purple bg-purple-50'
                        : 'border-gray-200 hover:border-carslead-purple/50'
                    } ${plan.popular ? 'ring-2 ring-carslead-blue' : ''}`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 right-4 bg-gradient-to-r from-carslead-purple to-carslead-blue text-white px-3 py-1 rounded-full text-xs font-bold">
                        הכי פופולרי ⭐
                      </div>
                    )}
                    <RadioGroupItem value={plan.id} id={plan.id} className="sr-only" />
                    <label htmlFor={plan.id} className="cursor-pointer block">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-xl">{plan.name}</h3>
                          <p className="text-sm text-gray-500">{plan.description}</p>
                        </div>
                        <div className="text-left">
                          <div className="text-2xl font-bold text-carslead-purple">
                            ₪{billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice}
                          </div>
                          <div className="text-xs text-gray-500">
                            לחודש
                          </div>
                        </div>
                      </div>
                      <ul className="space-y-1">
                        {plan.features.slice(0, 4).map((feature, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                            <CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </label>
                  </div>
                ))}
              </RadioGroup>

              {/* Price Summary */}
              <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border-2 border-green-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">מחיר לאחר תקופת הניסיון:</span>
                  <span className="text-xl font-bold text-carslead-purple">
                    ₪{getSelectedPlanPrice()}/{billingCycle === 'yearly' ? 'חודש' : 'חודש'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-green-700 font-bold">
                  <span>עלות ל-14 הימים הראשונים:</span>
                  <span className="text-2xl">₪0</span>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  * לא תחויב כל סכום במהלך תקופת הניסיון. ניתן לבטל בכל עת ללא עלות.
                </p>
              </div>
            </div>
          </div>

          {/* Left Side - Registration Form */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">פרטים אישיים ועסקיים</h2>
            
            {/* Google Registration Button */}
            <GoogleAuthButton mode="register" />
            
            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-4 text-gray-500">או</span>
              </div>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Personal Information */}
              <div className="grid grid-cols-2 gap-4">
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
              <div className="grid grid-cols-2 gap-4">
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

              <div className="grid grid-cols-2 gap-4">
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
                    placeholder="בחר סיסמה חזקה (לפחות 6 תווים)"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="pr-12 h-12 border-gray-200 rounded-xl focus:border-carslead-purple focus:ring-carslead-purple"
                    required
                    minLength={6}
                  />
                </div>
              </div>

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
                  <Link 
                    to="/terms-of-service" 
                    target="_blank"
                    className="text-carslead-purple hover:text-carslead-blue underline"
                  >
                    תנאי השימוש
                  </Link>
                  {' '}ו
                  <Link 
                    to="/privacy-policy" 
                    target="_blank"
                    className="text-carslead-purple hover:text-carslead-blue underline"
                  >
                    מדיניות הפרטיות
                  </Link>
                </label>
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
                {loading ? 'נרשם...' : 'התחל ניסיון חינם ל-14 ימים'}
              </Button>

              <p className="text-center text-sm text-gray-600 mt-4">
                כבר יש לך חשבון?{' '}
                <Link to="/login" className="text-carslead-purple hover:underline font-medium">
                  התחבר כאן
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

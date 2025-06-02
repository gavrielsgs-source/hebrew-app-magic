
import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ArrowRight, Car, Check } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const planDetails = {
  premium: {
    name: 'פרימיום',
    price: 199,
    description: 'מתאים לעסק קטן',
    features: [
      'עד 20 רכבים',
      'עד 50 לידים',
      'משתמש אחד',
      'עד 100 הודעות וואטסאפ',
      'דשבורד בסיסי',
      'תמיכה בוואטסאפ'
    ]
  },
  business: {
    name: 'ביזנס',
    price: 399,
    description: 'מתאים לעסק בינוני',
    features: [
      'עד 50 רכבים',
      'עד 200 לידים',
      'עד 5 משתמשים',
      'עד 500 הודעות וואטסאפ',
      'דשבורד מתקדם',
      'אנליטיקה מלאה',
      'תמיכה מועדפת'
    ]
  },
  enterprise: {
    name: 'אנטרפרייז',
    price: 699,
    description: 'מתאים למגרש גדול',
    features: [
      'ללא הגבלה על רכבים ולידים',
      'עד 10 משתמשים',
      'עד 2000 הודעות וואטסאפ',
      'אנליטיקה מותאמת אישית',
      'API מלא',
      'תמיכה VIP',
      'הדרכה אישית'
    ]
  }
};

export default function Payment() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: ''
  });

  const planId = searchParams.get('plan') as keyof typeof planDetails;
  const plan = planDetails[planId];

  if (!plan) {
    navigate('/');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.phone) {
      toast.error('אנא מלא את כל השדות');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('grow-payment', {
        body: {
          action: 'createPaymentProcess',
          payload: {
            fullName: formData.fullName,
            phone: formData.phone,
            sum: plan.price.toString(),
            planId: planId
          }
        }
      });

      if (error) {
        console.error('Payment error:', error);
        toast.error('שגיאה ביצירת תשלום. אנא נסה שוב.');
        return;
      }

      if (data?.url) {
        // Redirect to GROW payment page
        window.location.href = data.url;
      } else {
        toast.error('לא התקבל קישור תשלום. אנא נסה שוב.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('שגיאה בתהליך התשלום. אנא נסה שוב.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100" dir="rtl">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#2F3C7E] to-[#4CAF50] rounded-xl flex items-center justify-center">
            <Car className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-[#2F3C7E] to-[#4CAF50] bg-clip-text text-transparent">
            CarsLead
          </span>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              השלמת הרכישה
            </h1>
            <p className="text-gray-600">
              עוד שלב אחד קטן ותוכל להתחיל להשתמש במערכת
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Plan Summary */}
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="text-right">
                  חבילת {plan.name}
                </CardTitle>
                <CardDescription className="text-right">
                  {plan.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-[#2F3C7E] mb-2">
                    ₪{plan.price}
                  </div>
                  <div className="text-gray-500">לחודש</div>
                </div>
                
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3 text-right">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 ml-auto" />
                      <span className="text-gray-700 flex-1">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700 text-center">
                    ✅ תקופת ניסיון של 14 יום ללא עלות
                  </p>
                  <p className="text-sm text-blue-700 text-center mt-1">
                    ✅ אפשר לבטל בכל עת
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Payment Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-right">פרטים אישיים</CardTitle>
                <CardDescription className="text-right">
                  נצטרך כמה פרטים בסיסיים כדי ליצור עבורך חשבון
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-right">שם מלא</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="הכנס את השם המלא שלך"
                      value={formData.fullName}
                      onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                      required
                      className="text-right"
                      dir="rtl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-right">מספר טלפון</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="050-1234567"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      required
                      className="text-right"
                      dir="rtl"
                    />
                  </div>

                  <div className="border-t pt-6">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-gray-600">סך הכל לתשלום:</span>
                      <span className="text-2xl font-bold text-[#2F3C7E]">
                        ₪{plan.price}
                      </span>
                    </div>
                    
                    <Button
                      type="submit"
                      size="lg"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-[#2F3C7E] to-[#4CAF50] hover:from-[#1A2347] hover:to-[#45A049] py-6 text-lg"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          יוצר תשלום...
                        </div>
                      ) : (
                        <>
                          המשך לתשלום
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="text-center text-sm text-gray-500">
                    <p>בלחיצה על "המשך לתשלום" תועבר לדף התשלום המאובטח</p>
                    <p className="mt-1">התשלום מעובד באמצעות מערכת GROW המאובטחת</p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

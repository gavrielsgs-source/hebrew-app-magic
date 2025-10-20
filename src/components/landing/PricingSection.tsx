import { useState } from 'react';
import { PricingCard } from '@/components/subscription/PricingCard';
import { BillingToggle } from '@/components/subscription/BillingToggle';

interface PricingSectionProps {
  user: any;
  onPricingSelect: (plan: string) => void;
}

export function PricingSection({ user, onPricingSelect }: PricingSectionProps) {
  const [isYearly, setIsYearly] = useState(false);

  const getPrice = (monthlyPrice: number, yearlyPrice: number) => {
    return isYearly ? yearlyPrice : monthlyPrice;
  };

  return (
    <section className="py-12 md:py-20 bg-gradient-to-r from-slate-50 to-blue-50 w-full">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-block bg-gradient-to-r from-green-100 to-blue-100 rounded-full px-6 py-3 mb-6">
            <span className="text-green-700 font-bold text-lg">🎉 14 ימי ניסיון חינם - ללא כרטיס אשראי!</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            בחר את התוכנית המתאימה לך
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            כל התוכניות כוללות ניסיון חינם של 14 ימים עם גישה מלאה לכל התכונות
          </p>
        </div>

        <BillingToggle isYearly={isYearly} onToggle={setIsYearly} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto items-stretch">
          <PricingCard
            title="פרימיום"
            price={getPrice(199, 179)}
            description="מתאים לעסק קטן"
            features={[
              "עד 20 רכבים",
              "עד 50 לידים",
              "עד 2 משתמשים",
              "5 תבניות וואטסאפ",
              "100 הודעות וואטסאפ לחודש",
              "משימות ללא הגבלה",
              "דשבורד בסיסי",
              "תמיכה בוואטסאפ"
            ]}
            onSelect={() => user ? window.location.href = '/dashboard' : window.location.href = '/auth'}
          />

          <PricingCard
            title="ביזנס"
            price={getPrice(399, 349)}
            description="מתאים לעסק בינוני"
            features={[
              "עד 50 רכבים",
              "עד 200 לידים",
              "עד 5 משתמשים",
              "10 תבניות וואטסאפ",
              "500 הודעות וואטסאפ לחודש",
              "משימות ללא הגבלה",
              "דשבורד מתקדם",
              "אנליטיקה מלאה",
              "תמיכה מועדפת"
            ]}
            isPopular={true}
            onSelect={() => onPricingSelect('business')}
          />

          <PricingCard
            title="אנטרפרייז"
            price={getPrice(699, 619)}
            description="מתאים למגרש גדול"
            features={[
              "ללא הגבלה על רכבים ולידים",
              "עד 10 משתמשים",
              "תבניות וואטסאפ ללא הגבלה",
              "2000 הודעות וואטסאפ לחודש",
              "משימות ללא הגבלה",
              "אנליטיקה מותאמת אישית",
              "API מלא",
              "תמיכה VIP",
              "הדרכה אישית"
            ]}
            onSelect={() => onPricingSelect('enterprise')}
          />
        </div>
      </div>
    </section>
  );
}

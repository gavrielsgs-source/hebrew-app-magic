
import { PricingCard } from '@/components/subscription/PricingCard';

interface PricingSectionProps {
  user: any;
  onPricingSelect: (plan: string) => void;
}

export function PricingSection({ user, onPricingSelect }: PricingSectionProps) {
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-6 max-w-6xl mx-auto">
          <PricingCard
            title="פרימיום"
            price={199}
            description="מתאים לעסק קטן"
            features={[
              "עד 20 רכבים",
              "עד 50 לידים",
              "עד 2 משתמשים",
              "עד 100 הודעות וואטסאפ",
              "20 משימות",
              "דשבורד בסיסי",
              "תמיכה בוואטסאפ"
            ]}
            onSelect={() => user ? window.location.href = '/dashboard' : window.location.href = '/auth'}
          />

          <PricingCard
            title="ביזנס"
            price={399}
            description="מתאים לעסק בינוני"
            features={[
              "עד 50 רכבים",
              "עד 200 לידים",
              "עד 5 משתמשים",
              "עד 500 הודעות וואטסאפ",
              "100 משימות",
              "דשבורד מתקדם",
              "אנליטיקה מלאה",
              "תמיכה מועדפת"
            ]}
            isPopular={true}
            onSelect={() => onPricingSelect('business')}
          />

          <PricingCard
            title="אנטרפרייז"
            price={699}
            description="מתאים למגרש גדול"
            features={[
              "ללא הגבלה על רכבים ולידים",
              "עד 10 משתמשים",
              "עד 2000 הודעות וואטסאפ",
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


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
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            מחירים שקופים לכל סוחר
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            בחר את החבילה שמתאימה לעסק שלך - מחינם ועד פתרון מתקדם
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-6 max-w-7xl mx-auto">
          <PricingCard
            title="חינם לתמיד"
            price={0}
            description="מתאים להתחלה"
            features={[
              "עד 5 רכבים",
              "עד 10 לידים",
              "משתמש אחד",
              "עד 50 הודעות וואטסאפ",
              "10 משימות",
              "דשבורד בסיסי"
            ]}
            onSelect={() => user ? window.location.href = '/dashboard' : window.location.href = '/auth'}
          />

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
            onSelect={() => onPricingSelect('premium')}
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

        <div className="text-center mt-8 md:mt-12 px-4">
          <p className="text-gray-600 mb-4 text-sm md:text-base">
            💡 התחל עם החבילה החינמית - ללא מחויבות ולכל החיים
          </p>
          <p className="text-xs md:text-sm text-gray-500">
            אין דמי הפעלה • אפשר לשדרג בכל עת • תמיכה בעברית
          </p>
        </div>
      </div>
    </section>
  );
}

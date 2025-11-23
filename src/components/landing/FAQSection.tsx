
import { Card, CardContent } from '@/components/ui/card';

export function FAQSection() {
  return (
    <section className="py-12 md:py-20 bg-gradient-to-r from-slate-50 to-blue-50 w-full">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              שאלות נפוצות
            </h2>
            <p className="text-lg md:text-xl">
              כל מה שרצית לדעת על CarsLead
            </p>
          </div>

          <div className="space-y-6">
            <Card className="p-8 rounded-2xl border-0 shadow-md">
              <CardContent className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900">
                  צריך כרטיס אשראי בשביל הניסיון חינם?
                </h3>
                <p className="text-gray-700">
                  לא, לא צריך כרטיס אשראי ב-14 ימי הניסיון. תקבל גישה מלאה למערכת שתסתיים לאחר תקופת הניסיון.
                </p>
              </CardContent>
            </Card>

            <Card className="p-8 rounded-2xl border-0 shadow-md">
              <CardContent className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900">
                  האם זה מתאים גם לסוחרים קטנים?
                </h3>
                <p className="text-gray-700">
                  כן! המערכת פותחה במיוחד לסוחרי רכב קטנים ובינוניים. 
                  תוכל להתחיל חינם ולשדרג רק כשהעסק גדל.
                </p>
              </CardContent>
            </Card>

            <Card className="p-8 rounded-2xl border-0 shadow-md">
              <CardContent className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900">
                  צריך ידע טכנולוגי?
                </h3>
                <p className="text-gray-700">
                  ממש לא! המערכת פשוטה כמו לשלוח הודעת וואטסאפ. 
                  אם אתה יודע להשתמש בטלפון - אתה יודע להשתמש ב-CarsLead.
                </p>
              </CardContent>
            </Card>

            <Card className="p-8 rounded-2xl border-0 shadow-md">
              <CardContent className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900">
                  אפשר להשתמש רק בטלפון?
                </h3>
                <p className="text-gray-700">
                  כן! המערכת מותאמת למובייל בצורה מלאה. 
                  תוכל לנהל את כל העסק שלך מהטלפון.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

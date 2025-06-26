
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';

export function TestimonialsSection() {
  return (
    <section className="py-12 md:py-20 bg-white w-full">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            מה אומרים המשתמשים
          </h2>
          <p className="text-lg md:text-xl">
            סוחרים מכל הארץ משתמשים ב-CarsLead
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="p-8 hover:shadow-lg transition-shadow rounded-2xl border-0 shadow-md">
            <CardContent className="space-y-6">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 text-lg">
                "סוף סוף מערכת שלא מצריכה אותי להיות מומחה מחשבים. פשוט ויעיל."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">ד</span>
                </div>
                <div>
                  <div className="font-bold">דני כהן</div>
                  <div className="text-gray-500">תל אביב</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="p-8 hover:shadow-lg transition-shadow rounded-2xl border-0 shadow-md">
            <CardContent className="space-y-6">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 text-lg">
                "מאז שאני עם CarsLead - אני לא מפספס אף לקוח. המכירות עלו ב-40%!"
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">מ</span>
                </div>
                <div>
                  <div className="font-bold">מיכל לוי</div>
                  <div className="text-gray-500">חיפה</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="p-8 hover:shadow-lg transition-shadow rounded-2xl border-0 shadow-md">
            <CardContent className="space-y-6">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 text-lg">
                "ממליץ לכל סוחר - גם קטנים. המערכת פשוטה ומתאימה לכולם."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">א</span>
                </div>
                <div>
                  <div className="font-bold">אבי רוזן</div>
                  <div className="text-gray-500">באר שבע</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

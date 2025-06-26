
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle, Calendar, BarChart3, FolderOpen } from 'lucide-react';

export function BenefitsSection() {
  return (
    <section className="py-12 md:py-20 bg-white w-full">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            איך CarsLead עוזרת לך?
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            כל מה שאתה צריך לניהול מכירות מוצלח במקום אחד
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          <Card className="text-center p-8 hover:shadow-lg transition-shadow rounded-2xl border-0 shadow-md">
            <CardContent className="space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto">
                <MessageCircle className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold">שליחת רכבים לוואטסאפ</h3>
              <p className="text-gray-600">בלחיצה אחת שלח פרטי רכב מלאים ללקוח דרך וואטסאפ</p>
            </CardContent>
          </Card>

          <Card className="text-center p-8 hover:shadow-lg transition-shadow rounded-2xl border-0 shadow-md">
            <CardContent className="space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold">ניהול תזכורות אוטומטי</h3>
              <p className="text-gray-600">אל תפספס אף פגישה או מעקב חשוב עם התזכורות החכמות</p>
            </CardContent>
          </Card>

          <Card className="text-center p-8 hover:shadow-lg transition-shadow rounded-2xl border-0 shadow-md">
            <CardContent className="space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold">דשבורד עם נתונים חיים</h3>
              <p className="text-gray-600">ראה איך העסק שלך מתקדם עם דוחות ואנליטיקה מתקדמת</p>
            </CardContent>
          </Card>

          <Card className="text-center p-8 hover:shadow-lg transition-shadow rounded-2xl border-0 shadow-md">
            <CardContent className="space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto">
                <FolderOpen className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold">הכל במקום אחד</h3>
              <p className="text-gray-600">בלי פתקים ובלי כאב ראש - כל המידע מאורגן ונגיש</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

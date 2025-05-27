import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Car, 
  MessageCircle, 
  Calendar, 
  BarChart3, 
  FolderOpen, 
  Play, 
  CheckCircle, 
  ArrowLeft,
  Star,
  Users,
  TrendingUp,
  Shield,
  LogIn
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { PricingCard } from '@/components/subscription/PricingCard';

export default function Landing() {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const { user, loading } = useAuth();

  const handlePricingSelect = (plan: string) => {
    if (user) {
      // If user is logged in, redirect to subscription upgrade
      window.location.href = '/subscription/upgrade';
    } else {
      // If not logged in, redirect to auth
      window.location.href = '/auth';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100" dir="rtl">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#2F3C7E] to-[#4CAF50] rounded-xl flex items-center justify-center">
              <Car className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-[#2F3C7E] to-[#4CAF50] bg-clip-text text-transparent">
              CarsLead
            </span>
          </div>
          <div className="flex items-center gap-4">
            {loading ? (
              <div className="w-8 h-8 animate-spin border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
            ) : user ? (
              <Link to="/dashboard">
                <Button className="bg-gradient-to-r from-[#2F3C7E] to-[#4CAF50] hover:from-[#1A2347] hover:to-[#45A049] rounded-xl">
                  <LogIn className="ml-2 h-4 w-4" />
                  כניסה למערכת
                </Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button variant="outline" className="rounded-xl">
                  כניסה למערכת
                </Button>
              </Link>
            )}
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              ניהול לידים. רכבים. לקוחות.
              <span className="block text-transparent bg-gradient-to-r from-[#2F3C7E] to-[#4CAF50] bg-clip-text">
                הכל במקום אחד.
              </span>
            </h1>
            
            <h2 className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              מערכת שעוזרת לך לסגור יותר עסקאות – מכל מכשיר, בכל שעה.
            </h2>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              {user ? (
                <Link to="/dashboard">
                  <Button size="lg" className="bg-gradient-to-r from-[#2F3C7E] to-[#4CAF50] hover:from-[#1A2347] hover:to-[#45A049] text-lg px-8 py-6 rounded-2xl shadow-lg hover:shadow-xl transition-all">
                    כניסה למערכת
                  </Button>
                </Link>
              ) : (
                <Link to="/auth">
                  <Button size="lg" className="bg-gradient-to-r from-[#2F3C7E] to-[#4CAF50] hover:from-[#1A2347] hover:to-[#45A049] text-lg px-8 py-6 rounded-2xl shadow-lg hover:shadow-xl transition-all">
                    התחל בחינם
                  </Button>
                </Link>
              )}
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 py-6 rounded-2xl border-2"
                onClick={() => setIsVideoOpen(true)}
              >
                <Play className="ml-2 h-5 w-5" />
                צפה בסרטון הדגמה
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto text-center">
              <div>
                <div className="text-3xl font-bold text-[#2F3C7E]">500+</div>
                <div className="text-sm text-gray-600">סוחרים פעילים</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#4CAF50]">10K+</div>
                <div className="text-sm text-gray-600">לידים מנוהלים</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#2F3C7E]">98%</div>
                <div className="text-sm text-gray-600">שביעות רצון</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#4CAF50]">24/7</div>
                <div className="text-sm text-gray-600">זמינות</div>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="mt-16 relative">
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-4xl mx-auto">
              <img 
                src="/placeholder.svg" 
                alt="CarsLead Dashboard" 
                className="w-full rounded-2xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              איך CarsLead עוזרת לך?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              כל מה שאתה צריך לניהול מכירות מוצלח במקום אחד
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
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

      {/* Pricing Section */}
      <section className="py-20 bg-gradient-to-r from-slate-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              מחירים שקופים לכל סוחר
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              בחר את החבילה שמתאימה לעסק שלך
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <PricingCard
              title="פרימיום"
              price={199}
              description="מתאים לעסק קטן"
              features={[
                "עד 20 רכבים",
                "עד 50 לידים",
                "משתמש אחד",
                "עד 100 הודעות וואטסאפ BETA",
                "דשבורד בסיסי",
                "תמיכה בוואטסאפ"
              ]}
              onSelect={() => handlePricingSelect('premium')}
            />

            <PricingCard
              title="ביזנס"
              price={399}
              description="מתאים לעסק בינוני"
              features={[
                "עד 50 רכבים",
                "עד 200 לידים",
                "עד 5 משתמשים",
                "עד 500 הודעות וואטסאפ BETA",
                "דשבורד מתקדם",
                "אנליטיקה מלאה",
                "תמיכה מועדפת"
              ]}
              isPopular={true}
              onSelect={() => handlePricingSelect('business')}
            />

            <PricingCard
              title="אנטרפרייז"
              price={699}
              description="מתאים למגרש גדול"
              features={[
                "ללא הגבלה על רכבים ולידים",
                "עד 10 משתמשים",
                "עד 2000 הודעות וואטסאפ BETA",
                "אנליטיקה מותאמת אישית",
                "API מלא",
                "תמיכה VIP",
                "הדרכה אישית"
              ]}
              onSelect={() => handlePricingSelect('enterprise')}
            />
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              💡 כל החבילות כוללות תקופת ניסיון של 14 יום ללא עלות
            </p>
            <p className="text-sm text-gray-500">
              אין דמי הפעלה • אפשר לבטל בכל עת • תמיכה בעברית
            </p>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-20 bg-gradient-to-r from-slate-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-8">
              ראה את המערכת בפעולה
            </h2>
            <div className="bg-white rounded-3xl shadow-2xl p-8">
              <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-[#2F3C7E] to-[#4CAF50] hover:scale-105 transition-transform rounded-full w-20 h-20"
                  onClick={() => setIsVideoOpen(true)}
                >
                  <Play className="h-8 w-8" />
                </Button>
              </div>
              <p className="mt-6 text-gray-600">
                הדגמה של 60 שניות - איך המערכת עובדת בפועל
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              מה אומרים המשתמשים
            </h2>
            <p className="text-xl text-gray-600">
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

      {/* FAQ Section */}
      <section className="py-20 bg-gradient-to-r from-slate-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                שאלות נפוצות
              </h2>
              <p className="text-xl text-gray-600">
                כל מה שרצית לדעת על CarsLead
              </p>
            </div>

            <div className="space-y-6">
              <Card className="p-8 rounded-2xl border-0 shadow-md">
                <CardContent className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    האם זה מתאים גם לסוחרים קטנים?
                  </h3>
                  <p className="text-gray-700">
                    כן! המערכת פותחה במיוחד לסוחרי רכב קטנים ובינוניים. 
                    המחירים משתלמים וההתחלה פשוטה.
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

              <Card className="p-8 rounded-2xl border-0 shadow-md">
                <CardContent className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    כמה זה עולה?
                  </h3>
                  <p className="text-gray-700">
                    יש תקופת ניסיון ללא עלות, ואחר כך תבחר את המסלול שמתאים לך. 
                    המחירים שקופים וללא הפתעות.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#2F3C7E] to-[#4CAF50]">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto text-white">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              מוכן להתחיל?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              הצטרף ל-500+ סוחרי רכב שכבר משתמשים ב-CarsLead
            </p>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-md mx-auto">
              <div className="space-y-4">
                <Input 
                  type="email" 
                  placeholder="האימייל שלך" 
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/70 rounded-2xl"
                />
                <Input 
                  type="password" 
                  placeholder="בחר סיסמה" 
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/70 rounded-2xl"
                />
                <Link to="/auth">
                  <Button 
                    size="lg" 
                    className="w-full bg-white text-[#2F3C7E] hover:bg-gray-100 font-bold py-6 rounded-2xl shadow-lg"
                  >
                    הירשם עכשיו - חינם!
                  </Button>
                </Link>
              </div>
              
              <div className="flex items-center justify-center mt-6 space-x-reverse space-x-4">
                <CheckCircle className="h-5 w-5 text-green-300" />
                <span className="text-sm opacity-80">אין צורך בכרטיס אשראי</span>
              </div>
              
              <div className="flex items-center justify-center mt-2 space-x-reverse space-x-4">
                <CheckCircle className="h-5 w-5 text-green-300" />
                <span className="text-sm opacity-80">אפשר לבטל בכל רגע</span>
              </div>
              
              <p className="mt-6 text-sm opacity-70">
                כבר יש לך חשבון? 
                <Link to="/auth" className="underline hover:no-underline ml-1">
                  התחבר כאן
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[#2F3C7E] to-[#4CAF50] rounded-xl flex items-center justify-center">
                  <Car className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold">CarsLead</span>
              </div>
              <p className="text-gray-400">
                מערכת הלידים המתקדמת לסוחרי רכב בישראל
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">תמיכה</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">מרכז עזרה</a></li>
                <li><a href="#" className="hover:text-white">צור קשר</a></li>
                <li><a href="#" className="hover:text-white">סרטוני הדרכה</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">החברה</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">אודותינו</a></li>
                <li><a href="#" className="hover:text-white">הבלוג שלנו</a></li>
                <li><a href="#" className="hover:text-white">משרות</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">משפטי</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">תנאי שימוש</a></li>
                <li><a href="#" className="hover:text-white">מדיניות פרטיות</a></li>
                <li><a href="#" className="hover:text-white">תנאי התשלום</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© 2025 CarsLead – מערכת הלידים של ישראל. כל הזכויות שמורות.</p>
          </div>
        </div>
      </footer>

      {/* Video Modal */}
      {isVideoOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-4xl w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">הדגמת המערכת</h3>
              <Button 
                variant="ghost" 
                onClick={() => setIsVideoOpen(false)}
                className="rounded-full"
              >
                <ArrowLeft className="h-6 w-6" />
              </Button>
            </div>
            <div className="aspect-video bg-gray-100 rounded-2xl flex items-center justify-center">
              <p className="text-gray-500">כאן יופיע סרטון ההדגמה</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

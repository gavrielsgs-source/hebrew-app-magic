
import { 
  Users, Car, CheckSquare, BarChart3, FileText, MessageSquare, 
  Bell, Shield, Smartphone, Zap, Calendar, Target 
} from 'lucide-react';
import { NavigationHeader } from '@/components/landing/NavigationHeader';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { useAuth } from '@/hooks/use-auth';

export default function Features() {
  const { user, loading } = useAuth();

  const mainFeatures = [
    {
      icon: Users,
      title: 'ניהול לידים חכם',
      description: 'מעקב אחר כל לקוח פוטנציאלי, דירוג אוטומטי לפי עניין, ותזכורות לטיפול בזמן.',
      features: ['ייבוא אוטומטי מפייסבוק', 'דירוג לידים חכם', 'תזכורות אוטומטיות', 'היסטוריית שיחות']
    },
    {
      icon: Car,
      title: 'ניהול מלאי רכבים',
      description: 'רישום מפורט של כל רכב, מעקב סטטוס, תמונות ומסמכים - הכל במקום אחד.',
      features: ['העלאת תמונות מרובות', 'מעקב סטטוס מכירה', 'פרטים טכניים מלאים', 'חישוב רווחיות']
    },
    {
      icon: CheckSquare,
      title: 'ניהול משימות ויומן',
      description: 'תכנון וארגון כל הפעילות היומית, פגישות עם לקוחות ותזכורות חשובות.',
      features: ['יומן משולב', 'תזכורות ניידות', 'משימות חוזרות', 'סטטוסים מתקדמים']
    },
    {
      icon: BarChart3,
      title: 'אנליטיקה ודוחות',
      description: 'תובנות עמוקות על הביצועים, מגמות מכירות וניתוח ROI מפורט.',
      features: ['דשבורד חכם', 'דוחות בזמן אמת', 'ניתוח מגמות', 'תחזיות מכירות']
    },
    {
      icon: FileText,
      title: 'ניהול מסמכים',
      description: 'אחסון מאובטח של כל המסמכים, חוזים וקבלות עם אפשרות חיפוש מהיר.',
      features: ['אחסון ענן מאובטח', 'תבניות מסמכים', 'חתימה דיגיטלית', 'גיבוי אוטומטי']
    },
    {
      icon: MessageSquare,
      title: 'אינטגרציה עם וואטסאפ',
      description: 'שליחת הודעות אוטומטיות, תבניות מוכנות וניהול שיחות ישירות מהמערכת.',
      features: ['תבניות הודעות', 'שליחה אוטומטית', 'מעקב תגובות', 'ניהול קבוצות']
    }
  ];

  const additionalFeatures = [
    { icon: Bell, title: 'התראות חכמות', description: 'קבלת עדכונים בזמן אמת על לידים חדשים ופעילות חשובה' },
    { icon: Shield, title: 'אבטחה מתקדמת', description: 'הצפנה מלאה ושמירה על פרטיות המידע ברמה הבנקאית' },
    { icon: Smartphone, title: 'אפליקציה ניידת', description: 'גישה מלאה מכל מכשיר, בכל מקום ובכל זמן' },
    { icon: Zap, title: 'ביצועים מהירים', description: 'מערכת מהירה ויציבה שמתמודדת עם נפח עבודה גבוה' },
    { icon: Calendar, title: 'סנכרון יומנים', description: 'סנכרון עם גוגל קלנדר ויומנים אחרים' },
    { icon: Target, title: 'מעקב יעדים', description: 'הגדרת יעדי מכירות ומעקב אחר השגתם' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 w-full" dir="rtl">
      <NavigationHeader user={user} loading={loading} />
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 md:py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-[#2F3C7E] to-[#4CAF50] bg-clip-text text-transparent">
            תכונות המערכת
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-12 leading-relaxed">
            כל מה שסוחר רכב צריך במקום אחד - פשוט, יעיל ומתקדם
          </p>
        </div>
      </section>

      {/* Main Features */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mainFeatures.map((feature, index) => (
            <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-[#2F3C7E] to-[#4CAF50] rounded-xl flex items-center justify-center">
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-[#2F3C7E]">
                {feature.title}
              </h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                {feature.description}
              </p>
              <ul className="space-y-2">
                {feature.features.map((item, idx) => (
                  <li key={idx} className="flex items-center text-sm text-gray-700">
                    <div className="w-1.5 h-1.5 bg-[#4CAF50] rounded-full ml-2"></div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Additional Features */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-[#2F3C7E]">
            ועוד הרבה יכולות נוספות
          </h2>
          <p className="text-gray-600">פיצ'רים נוספים שיעזרו לכם לנהל את העסק בצורה מושלמת</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {additionalFeatures.map((feature, index) => (
            <div key={index} className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/40 hover:bg-white/80 transition-all duration-300">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#2F3C7E]/20 to-[#4CAF50]/20 rounded-lg flex items-center justify-center">
                  <feature.icon className="h-5 w-5 text-[#2F3C7E]" />
                </div>
                <h4 className="font-bold text-[#2F3C7E] mr-3">
                  {feature.title}
                </h4>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Technology Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-[#2F3C7E] to-[#4CAF50] rounded-2xl p-8 md:p-12 text-white">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              טכנולוגיה מתקדמת
            </h2>
            <p className="text-lg opacity-90">
              המערכת בנויה על טכנולוגיות החדישות ביותר להבטחת ביצועים מעולים
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
              <Shield className="h-12 w-12 mx-auto mb-4" />
              <h3 className="font-bold mb-2">אבטחה מלאה</h3>
              <p className="text-sm opacity-90">הצפנה ברמה בנקאית וגיבויים רציפים</p>
            </div>
            <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
              <Zap className="h-12 w-12 mx-auto mb-4" />
              <h3 className="font-bold mb-2">ביצועים גבוהים</h3>
              <p className="text-sm opacity-90">מהירות טעינה מקסימלית וזמינות 99.9%</p>
            </div>
            <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
              <Smartphone className="h-12 w-12 mx-auto mb-4" />
              <h3 className="font-bold mb-2">נגישות מלאה</h3>
              <p className="text-sm opacity-90">עבודה מכל מכשיר בכל מקום ובכל זמן</p>
            </div>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}

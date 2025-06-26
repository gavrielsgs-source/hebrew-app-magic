import { CheckCircle, User, TrendingUp, Clock, Shield, Zap } from 'lucide-react';
import { NavigationHeader } from '@/components/landing/NavigationHeader';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { useAuth } from '@/hooks/use-auth';

export default function WhyChooseUs() {
  const { user, loading } = useAuth();

  const benefits = [
    {
      icon: User,
      title: 'נבנה על ידי סוחר רכב',
      description: 'המערכת פותחה על ידי גבריאל, סוחר רכב מנוסה שמבין בדיוק את הצרכים והאתגרים שלכם בתחום.',
      highlight: true
    },
    {
      icon: TrendingUp,
      title: 'העלאת מכירות של עד 40%',
      description: 'לקוחותינו מדווחים על עלייה משמעותית במכירות הודות לניהול יעיל יותר של לידים.'
    },
    {
      icon: Clock,
      title: 'חיסכון של 3 שעות ביום',
      description: 'אוטומציה חכמה וממשק ידידותי מאפשרים לכם להתמקד במה שחשוב - מכירת רכבים.'
    },
    {
      icon: Shield,
      title: 'אמינות וביטחון מלא',
      description: 'כל המידע שלכם מאובטח ברמה הגבוהה ביותר, עם גיבויים אוטומטיים ורציפים.'
    },
    {
      icon: Zap,
      title: 'התחלה מהירה תוך דקות',
      description: 'ממשק פשוט ואינטואיטיבי - תוכלו להתחיל לעבוד מיד ללא הדרכות מסובכות.'
    },
    {
      icon: CheckCircle,
      title: 'תמיכה אישית 24/7',
      description: 'צוות התמיכה שלנו זמין עבורכם בכל שעה, כי אנחנו מבינים שהעסק שלכם לא נעצר.'
    }
  ];

  const stats = [
    { number: '500+', label: 'סוחרי רכב מרוצים' },
    { number: '50,000+', label: 'לידים מנוהלים בחודש' },
    { number: '95%', label: 'שביעות רצון לקוחות' },
    { number: '40%', label: 'ממוצע עלייה במכירות' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 w-full" dir="rtl">
      <NavigationHeader user={user} loading={loading} />
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 md:py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-[#2F3C7E] to-[#4CAF50] bg-clip-text text-transparent">
            למה לבחור ב-CarsLead?
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
            המערכת היחידה שנבנתה על ידי סוחר רכב, עבור סוחרי רכב - 
            <br className="hidden md:block" />
            כי רק מי שעבד בתחום יודע בדיוק מה אתם צריכים
          </p>
          
          {/* Creator Story */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-lg border border-white/50 mb-12">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#2F3C7E] to-[#4CAF50] rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
            </div>
            <h3 className="text-xl md:text-2xl font-bold mb-4 text-[#2F3C7E]">הסיפור שלי</h3>
            <div className="text-gray-700 leading-relaxed text-right space-y-4">
              <p className="font-semibold text-lg">
                "אני גבריאל, סוחר רכב בעצמי - כמוכם."
              </p>
              
              <p>
                במשך שנים התמודדתי עם אותם כאבים שאתם חווים יום-יום:
                לקוחות שהתעניינו - ונשכחו. רכבים שנכנסו למלאי - ולא נשלחו לאף אחד.
                שיחות שהתפספסו, פגישות שלא נרשמו, והכי גרוע - אובדן של לידים חמים בגלל חוסר זמן או סדר.
              </p>
              
              <p>
                הרגשתי שאני טוב במה שאני עושה, אבל הכלים פשוט לא היו שם.
                רציתי לשלוח מפרט ללקוח בלחיצה אחת. לרשום תזכורת לנסיעת מבחן בלי לפספס. לדעת מי דיבר איתי, מתי, ועל איזה רכב - בלי לחפש בוואטסאפ או באקסלים.
              </p>
              
              <p>
                ככה נולדה CarsLead - מערכת שבנויה מהשטח, בשביל הסוחרים.
                לא עוד מערכת כללית שמתאימה לכולם - אלא פתרון אמיתי שיחזיר לכם שליטה, סדר, ושקט תפעולי.
              </p>
              
              <p>
                כאן, הכל בלחיצת כפתור.
                מכל מכשיר. מכל מקום. עם ליווי ותמיכה צמודה.
              </p>
              
              <p className="font-semibold text-lg text-[#2F3C7E]">
                ברוכים הבאים למהפכה של סוחרי הרכב.
                <br />
                הגיע הזמן לעבוד חכם.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center shadow-lg border border-white/50">
              <div className="text-2xl md:text-3xl font-bold text-[#2F3C7E] mb-2">
                {stat.number}
              </div>
              <div className="text-sm md:text-base text-gray-600">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => (
            <div 
              key={index} 
              className={`p-6 rounded-2xl shadow-lg border transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                benefit.highlight 
                  ? 'bg-gradient-to-br from-[#2F3C7E] to-[#4CAF50] text-white border-transparent' 
                  : 'bg-white/80 backdrop-blur-sm border-white/50'
              }`}
            >
              <div className="flex items-center mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  benefit.highlight ? 'bg-white/20' : 'bg-gradient-to-br from-[#2F3C7E] to-[#4CAF50]'
                }`}>
                  <benefit.icon className={`h-6 w-6 ${benefit.highlight ? 'text-white' : 'text-white'}`} />
                </div>
              </div>
              <h3 className={`text-lg font-bold mb-3 ${benefit.highlight ? 'text-white' : 'text-[#2F3C7E]'}`}>
                {benefit.title}
              </h3>
              <p className={`leading-relaxed ${benefit.highlight ? 'text-white/90' : 'text-gray-600'}`}>
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-[#2F3C7E] to-[#4CAF50] rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            מוכנים להתחיל?
          </h2>
          <p className="text-lg md:text-xl mb-8 opacity-90">
            הצטרפו לאלפי סוחרי הרכב שכבר משתמשים ב-CarsLead
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-[#2F3C7E] px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors">
              התחל ניסיון חינם
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-xl font-bold hover:bg-white/10 transition-colors">
              צפה בהדגמה
            </button>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}


import { Button } from '@/components/ui/button';
import { Play, Zap, CheckCircle, TrendingUp, Users, Car } from 'lucide-react';

interface HeroSectionProps {
  user: any;
  onVideoOpen: () => void;
}

export function HeroSection({ user, onVideoOpen }: HeroSectionProps) {
  const handleGetStarted = () => {
    if (user) {
      window.location.href = '/dashboard';
    } else {
      window.location.href = '/auth';
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-bl from-slate-50 via-blue-50 to-indigo-100 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-bl from-blue-100/30 to-transparent rounded-full transform rotate-12"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-indigo-100/30 to-transparent rounded-full transform -rotate-12"></div>
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400/30 rounded-full animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-indigo-400/30 rounded-full animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-right space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium text-[#2F3C7E] border border-blue-100">
              <CheckCircle className="h-4 w-4 text-green-500" />
              מערכת מובילה בישראל
            </div>

            {/* Main heading - Made larger and more prominent */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-gray-900">
              ניהול לידים.
              <br />
              רכבים. לקוחות.
              <br />
              <span className="bg-gradient-to-l from-[#2F3C7E] to-[#4CAF50] bg-clip-text text-transparent">
                הכל במקום אחד.
              </span>
            </h1>

            {/* Enhanced description */}
            <p className="text-xl md:text-2xl text-gray-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              המערכת המתקדמת ביותר לסוחרי רכב - מנהלת לידים, מלאי, משימות ומכירות
              <span className="block mt-2 text-lg font-medium text-[#2F3C7E]">
                עם בינה מלאכותית מתקדמת ואוטומציה מלאה
              </span>
            </p>

            {/* Key features */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 text-sm">
              <div className="flex items-center gap-2 bg-white/60 rounded-full px-4 py-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span>עלייה של 40% במכירות</span>
              </div>
              <div className="flex items-center gap-2 bg-white/60 rounded-full px-4 py-2">
                <Users className="h-4 w-4 text-blue-500" />
                <span>+500 סוחרים פעילים</span>
              </div>
              <div className="flex items-center gap-2 bg-white/60 rounded-full px-4 py-2">
                <Car className="h-4 w-4 text-orange-500" />
                <span>+10K רכבים מנוהלים</span>
              </div>
            </div>

            {/* CTA Buttons - Enhanced design */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start items-center">
              <Button 
                size="lg" 
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-[#2F3C7E] to-[#4CAF50] hover:from-[#1A2347] hover:to-[#45A049] text-white px-10 py-6 text-xl rounded-2xl shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105 hover:-translate-y-1"
              >
                <Zap className="h-6 w-6 ml-3" />
                {user ? 'כניסה למערכת' : 'התחל בחינם עכשיו'}
              </Button>
              
              <Button 
                variant="ghost" 
                size="lg"
                onClick={onVideoOpen}
                className="text-gray-600 hover:text-[#2F3C7E] px-10 py-6 text-xl transition-all hover:bg-white/60 rounded-2xl"
              >
                <Play className="h-6 w-6 ml-3" />
                צפה בהדגמה חיה
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="pt-8">
              <p className="text-sm text-gray-500 mb-4">בטוח ומהימן - משתמשים בנו:</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#4CAF50] mb-1">24/7</div>
                  <div className="text-xs text-gray-500">תמיכה</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#2F3C7E] mb-1">99%</div>
                  <div className="text-xs text-gray-500">זמינות</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#4CAF50] mb-1">+15K</div>
                  <div className="text-xs text-gray-500">לידים חודשיים</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#2F3C7E] mb-1">98%</div>
                  <div className="text-xs text-gray-500">שביעות רצון</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Combined System Images */}
          <div className="relative flex items-center justify-center">
            <div className="relative w-full max-w-2xl">
              {/* Desktop Images - Stacked Diagonally */}
              <div className="relative">
                {/* First Desktop Image */}
                <div className="absolute top-0 right-0 transform rotate-6 shadow-2xl rounded-xl overflow-hidden z-10">
                  <img
                    src="/lovable-uploads/9e5691a8-a637-4121-87d1-2d4ec8b232e3.png"
                    alt="מלאי רכבים מקצועי"
                    className="w-80 h-48 object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
                
                {/* Second Desktop Image */}
                <div className="absolute top-16 right-24 transform -rotate-3 shadow-2xl rounded-xl overflow-hidden z-20">
                  <img
                    src="/lovable-uploads/5dcfcdf9-081b-4cba-af46-143e740878d2.png"
                    alt="אנליטיקס וסיכומים"
                    className="w-80 h-48 object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
              </div>

              {/* iPhone Mockup with Mobile Image */}
              <div className="relative z-30 mt-32 mr-8">
                {/* iPhone Frame */}
                <div className="relative bg-black rounded-[3rem] p-2 shadow-2xl transform hover:rotate-2 transition-transform duration-300">
                  <div className="bg-black rounded-[2.5rem] overflow-hidden">
                    {/* iPhone Notch */}
                    <div className="relative bg-black h-8 flex items-center justify-center">
                      <div className="w-32 h-6 bg-black rounded-b-2xl"></div>
                    </div>
                    
                    {/* Mobile Screen */}
                    <div className="relative bg-white">
                      <img
                        src="/lovable-uploads/f9f8d800-8eaf-45ae-b55c-4ea76d1ec04e.png"
                        alt="דשבורד מובייל מתקדם"
                        className="w-64 h-auto object-cover"
                      />
                    </div>
                    
                    {/* iPhone Home Indicator */}
                    <div className="bg-black h-6 flex items-center justify-center">
                      <div className="w-32 h-1 bg-white rounded-full opacity-60"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Labels */}
              <div className="absolute top-12 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg z-40">
                <p className="text-sm font-medium text-[#2F3C7E]">מלאי רכבים</p>
              </div>
              
              <div className="absolute top-28 left-12 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg z-40">
                <p className="text-sm font-medium text-[#4CAF50]">אנליטיקס</p>
              </div>
              
              <div className="absolute bottom-32 left-8 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg z-40">
                <p className="text-sm font-medium text-[#2F3C7E]">דשבורד מובייל</p>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-8 -right-8 w-16 h-16 bg-gradient-to-r from-[#2F3C7E] to-[#4CAF50] rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute -bottom-8 -left-8 w-12 h-12 bg-gradient-to-r from-[#4CAF50] to-[#2F3C7E] rounded-full opacity-20 animate-bounce"></div>
              <div className="absolute top-1/2 -right-4 w-4 h-4 bg-blue-400 rounded-full animate-ping"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

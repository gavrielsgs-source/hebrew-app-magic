
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
      window.location.href = '/trial-signup';
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
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-right space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium text-brand-primary border border-blue-100">
              <CheckCircle className="h-4 w-4 text-green-500" />
              מערכת מובילה בישראל
            </div>

            {/* Main heading - Made larger and more prominent */}
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold leading-tight text-gray-900">
              ניהול לידים.
              <br />
              רכבים. לקוחות.
              <br />
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                הכל במקום אחד.
              </span>
            </h1>

            {/* Enhanced description */}
            <p className="text-lg md:text-xl lg:text-2xl text-gray-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              המערכת המתקדמת ביותר לסוחרי רכב - מנהלת לידים, מלאי, משימות ומכירות
              <span className="block mt-2 text-base lg:text-lg font-medium text-brand-primary">
                עם בינה מלאכותית מתקדמת ואוטומציה מלאה
              </span>
            </p>

            {/* Key features */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-3 text-sm">
              <div className="flex items-center gap-2 bg-white/60 rounded-full px-3 py-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span>עלייה של 40% במכירות</span>
              </div>
              <div className="flex items-center gap-2 bg-white/60 rounded-full px-3 py-2">
                <Users className="h-4 w-4 text-blue-500" />
                <span>+500 סוחרים פעילים</span>
              </div>
              <div className="flex items-center gap-2 bg-white/60 rounded-full px-3 py-2">
                <Car className="h-4 w-4 text-orange-500" />
                <span>+10K רכבים מנוהלים</span>
              </div>
            </div>

            {/* CTA Buttons - Enhanced design */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
              <Button 
                size="lg" 
                onClick={handleGetStarted}
                className="bg-gradient-primary hover:opacity-90 text-primary-foreground px-8 py-5 text-lg lg:text-xl rounded-2xl shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105 hover:-translate-y-1"
              >
                <Zap className="h-5 w-5 ml-3" />
                {user ? 'כניסה למערכת' : 'התחל ניסיון חינם ל-14 ימים'}
              </Button>
              
              <Button 
                variant="ghost" 
                size="lg"
                onClick={onVideoOpen}
                className="text-muted-foreground hover:text-brand-primary px-8 py-5 text-lg lg:text-xl transition-all hover:bg-background/60 rounded-2xl"
              >
                <Play className="h-5 w-5 ml-3" />
                צפה בהדגמה חיה
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="pt-6">
              <p className="text-sm text-gray-500 mb-4">בטוח ומהימן - משתמשים בנו:</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl lg:text-3xl font-bold text-brand-secondary mb-1">24/7</div>
                  <div className="text-xs text-gray-500">תמיכה</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl lg:text-3xl font-bold text-brand-primary mb-1">99%</div>
                  <div className="text-xs text-gray-500">זמינות</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl lg:text-3xl font-bold text-brand-secondary mb-1">+15K</div>
                  <div className="text-xs text-gray-500">לידים חודשיים</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl lg:text-3xl font-bold text-brand-primary mb-1">98%</div>
                  <div className="text-xs text-gray-500">שביעות רצון</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Mobile-first responsive images */}
          <div className="relative flex items-center justify-center lg:block">
            {/* Mobile Layout */}
            <div className="block lg:hidden w-full max-w-sm mx-auto">
              {/* Mobile Image - Single centered image */}
              <div className="relative w-full">
                <img
                  src="/lovable-uploads/25f76e09-b68f-4546-ae11-feadf0586392.png"
                  alt="דשבורד מובייל מתקדם"
                  className="w-full h-auto rounded-2xl shadow-2xl"
                />
                <div className="absolute -bottom-4 -right-4 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
                  <p className="text-sm font-medium text-brand-primary">דשבורד מובייל</p>
                </div>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden lg:block relative w-full max-w-3xl h-96">
              {/* Mobile Image - Left side, doubled in size and transparent background */}
              <div className="absolute top-0 left-0 z-30">
                <img
                  src="/lovable-uploads/25f76e09-b68f-4546-ae11-feadf0586392.png"
                  alt="דשבורד מובייל מתקדם"
                  className="w-96 h-auto"
                />
              </div>

              {/* Desktop Images - Right side, larger and stacked */}
              <div className="absolute top-0 right-0">
                {/* Desktop Background Image - Back */}
                <div className="shadow-2xl rounded-xl overflow-hidden" style={{ width: '450px', height: '280px' }}>
                  <img
                    src="/lovable-uploads/9e5691a8-a637-4121-87d1-2d4ec8b232e3.png"
                    alt="מלאי רכבים מקצועי"
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-60"></div>
                </div>
              </div>
              
              {/* Desktop Front Image - Overlapping on top */}
              <div className="absolute top-16 right-12 shadow-2xl rounded-xl overflow-hidden z-20" style={{ width: '450px', height: '280px' }}>
                <img
                  src="/lovable-uploads/5dcfcdf9-081b-4cba-af46-143e740878d2.png"
                  alt="אנליטיקס וסיכומים"
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-40"></div>
              </div>

              {/* Floating Labels */}
              <div className="absolute top-12 left-44 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg z-40 transform rotate-2">
                <p className="text-sm font-medium text-brand-primary">דשבורד מובייל</p>
              </div>
              
              <div className="absolute top-24 right-12 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg z-40 transform -rotate-1">
                <p className="text-sm font-medium text-brand-secondary">מלאי רכבים</p>
              </div>
              
              <div className="absolute bottom-32 right-20 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg z-40 transform rotate-1">
                <p className="text-sm font-medium text-[#2F3C7E]">אנליטיקס</p>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-8 -right-8 w-16 h-16 bg-gradient-to-r from-[#2F3C7E] to-[#4CAF50] rounded-full opacity-20 animate-pulse transform rotate-45"></div>
              <div className="absolute -bottom-8 -left-8 w-12 h-12 bg-gradient-to-r from-[#4CAF50] to-[#2F3C7E] rounded-full opacity-20 animate-bounce transform -rotate-12"></div>
              <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-blue-400 rounded-full animate-ping transform rotate-45"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, Star, Users, Zap } from 'lucide-react';

interface HeroSectionProps {
  user: any;
}

export function HeroSection({ user }: HeroSectionProps) {
  const handleGetStarted = () => {
    if (user) {
      window.location.href = '/dashboard';
    } else {
      window.location.href = '/register';
    }
  };

  const scrollToDemo = () => {
    const demoSection = document.querySelector('[data-section="demo"]');
    if (demoSection) {
      demoSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-bl from-slate-50 via-blue-50 to-indigo-100 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-bl from-blue-100/30 to-transparent rounded-full transform rotate-12"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-indigo-100/30 to-transparent rounded-full transform -rotate-12"></div>
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Content */}
            <div className="text-center lg:text-right space-y-8">
              {/* Trust indicators */}
              <div className="flex items-center justify-center lg:justify-end gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-[#4CAF50]" />
                  <span>500+ עסקים</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-[#4CAF50] fill-current" />
                  <span>4.9/5 דירוג</span>
                </div>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-l from-[#2F3C7E] to-[#4CAF50] bg-clip-text text-transparent">
                  המערכת החכמה
                </span>
                <br />
                <span className="text-gray-900">לניהול מכירות רכב</span>
              </h1>

              <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                נהל את כל הלידים, המלאי והמכירות שלך במקום אחד. 
                חסוך זמן, הגדל מכירות וספק שירות מעולה ללקוחותיך.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-end">
                <Button 
                  size="lg" 
                  onClick={handleGetStarted}
                  className="bg-gradient-to-r from-[#2F3C7E] to-[#4CAF50] hover:from-[#1A2347] hover:to-[#45A049] text-white px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                >
                  <Zap className="h-5 w-5 ml-2" />
                  {user ? 'כניסה למערכת' : 'התחל עכשיו בחינם'}
                </Button>
                
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={scrollToDemo}
                  className="border-2 border-[#2F3C7E] text-[#2F3C7E] hover:bg-[#2F3C7E] hover:text-white px-8 py-4 text-lg rounded-xl transition-all"
                >
                  <Play className="h-5 w-5 ml-2" />
                  צפה בהדגמה
                </Button>
              </div>

              {/* Social proof */}
              <div className="pt-8 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-4">מהסוכנויות המובילות בישראל כבר משתמשות במערכת:</p>
                <div className="flex items-center justify-center lg:justify-end gap-8 opacity-60">
                  <div className="text-sm font-medium">סוכנות אלפא</div>
                  <div className="text-sm font-medium">רכב ישראלי</div>
                  <div className="text-sm font-medium">מוטור פלוס</div>
                </div>
              </div>
            </div>

            {/* Visual */}
            <div className="relative">
              <div className="bg-white rounded-3xl shadow-2xl p-8 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="bg-gradient-to-br from-[#2F3C7E] to-[#4CAF50] rounded-2xl p-6 text-white">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm opacity-90">לידים חדשים היום</span>
                      <span className="text-2xl font-bold">12</span>
                    </div>
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full w-3/4 bg-white rounded-full"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div className="text-center">
                        <div className="text-xl font-bold">₪850K</div>
                        <div className="text-xs opacity-80">מכירות החודש</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold">45</div>
                        <div className="text-xs opacity-80">רכבים במלאי</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 bg-[#4CAF50] text-white p-3 rounded-xl shadow-lg transform rotate-12">
                <Zap className="h-6 w-6" />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-[#2F3C7E] text-white p-3 rounded-xl shadow-lg transform -rotate-12">
                <Star className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

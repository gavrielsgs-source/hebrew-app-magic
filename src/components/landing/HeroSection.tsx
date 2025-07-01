
import { Button } from '@/components/ui/button';
import { Play, Zap, CheckCircle, TrendingUp, Users, Car } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

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

  const systemImages = [
    {
      src: '/lovable-uploads/f9f8d800-8eaf-45ae-b55c-4ea76d1ec04e.png',
      title: 'דשבורד מובייל מתקדם',
      description: 'ניהול מלא של כל הפעילות ישירות מהמובייל'
    },
    {
      src: '/lovable-uploads/9e5691a8-a637-4121-87d1-2d4ec8b232e3.png',
      title: 'מלאי רכבים מקצועי',
      description: 'תצוגה מושלמת של כל הרכבים עם כל הפרטים'
    },
    {
      src: '/lovable-uploads/5dcfcdf9-081b-4cba-af46-143e740878d2.png',
      title: 'אנליטיקס וסיכומים',
      description: 'דוחות מפורטים ותובנות עסקיות מתקדמות'
    }
  ];

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

          {/* Right Content - System Images Carousel */}
          <div className="relative">
            <div className="relative bg-white/10 backdrop-blur-sm rounded-3xl p-8 shadow-2xl">
              <Carousel className="w-full max-w-md mx-auto" opts={{ align: "start", loop: true }}>
                <CarouselContent>
                  {systemImages.map((image, index) => (
                    <CarouselItem key={index}>
                      <div className="text-center space-y-4">
                        <div className="relative group">
                          <img
                            src={image.src}
                            alt={image.title}
                            className="w-full max-w-sm mx-auto rounded-2xl shadow-xl transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-lg font-bold text-[#2F3C7E]">{image.title}</h3>
                          <p className="text-sm text-gray-600">{image.description}</p>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="hidden md:flex -left-12 bg-white/80 hover:bg-white border-2 border-blue-100" />
                <CarouselNext className="hidden md:flex -right-12 bg-white/80 hover:bg-white border-2 border-blue-100" />
              </Carousel>

              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-[#2F3C7E] to-[#4CAF50] rounded-full animate-bounce"></div>
              <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-r from-[#4CAF50] to-[#2F3C7E] rounded-full animate-pulse"></div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -z-10 -top-10 -right-10 w-20 h-20 bg-blue-200/30 rounded-full blur-xl"></div>
            <div className="absolute -z-10 -bottom-10 -left-10 w-16 h-16 bg-green-200/30 rounded-full blur-xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
}

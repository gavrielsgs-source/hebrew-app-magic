
import { Button } from '@/components/ui/button';
import { Play, Zap } from 'lucide-react';

interface HeroSectionProps {
  user: any;
  onVideoOpen: () => void;
}

export function HeroSection({ user, onVideoOpen }: HeroSectionProps) {
  const handleGetStarted = () => {
    if (user) {
      window.location.href = '/dashboard';
    } else {
      window.location.href = '/register';
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
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Main heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-gray-900">
            ניהול לידים. רכבים. לקוחות.
            <br />
            <span className="bg-gradient-to-l from-[#2F3C7E] to-[#4CAF50] bg-clip-text text-transparent">
              הכל במקום אחד.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
            מערכת עזורת לך לנהל יותר עמוקות – מכל מכירות, בכל שנה.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-[#2F3C7E] to-[#4CAF50] hover:from-[#1A2347] hover:to-[#45A049] text-white px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              <Zap className="h-5 w-5 ml-2" />
              {user ? 'כניסה למערכת' : 'התחל בחינם'}
            </Button>
            
            <Button 
              variant="ghost" 
              size="lg"
              onClick={onVideoOpen}
              className="text-gray-600 hover:text-[#2F3C7E] px-8 py-4 text-lg transition-all"
            >
              <Play className="h-5 w-5 ml-2" />
              צפה בהדגמה
            </Button>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-8">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-[#4CAF50] mb-1">24/7</div>
              <div className="text-sm text-gray-500">זמינות</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-[#2F3C7E] mb-1">98%</div>
              <div className="text-sm text-gray-500">שביעות רצון</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-[#4CAF50] mb-1">+10K</div>
              <div className="text-sm text-gray-500">לידים מנוהלים</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-[#2F3C7E] mb-1">+500</div>
              <div className="text-sm text-gray-500">סוחרים פעילים</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

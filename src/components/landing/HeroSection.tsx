
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HeroSectionProps {
  user: any;
  onVideoOpen: () => void;
}

export function HeroSection({ user, onVideoOpen }: HeroSectionProps) {
  return (
    <section className="container mx-auto px-4 py-8 md:py-16 text-center w-full">
      <div className="max-w-4xl mx-auto">
        <div className="animate-fade-in">
          <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight">
            ניהול לידים. רכבים. לקוחות.
            <span className="block text-transparent bg-gradient-to-r from-[#2F3C7E] to-[#4CAF50] bg-clip-text">
              הכל במקום אחד.
            </span>
          </h1>
          
          <h2 className="text-lg md:text-xl lg:text-2xl text-gray-600 mb-6 md:mb-8 max-w-3xl mx-auto px-4">
            מערכת שעוזרת לך לסגור יותר עסקאות – מכל מכשיר, בכל שעה.
          </h2>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center mb-8 md:mb-12 px-4">
            {user ? (
              <Link to="/dashboard">
                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-[#2F3C7E] to-[#4CAF50] hover:from-[#1A2347] hover:to-[#45A049] text-base md:text-lg px-6 md:px-8 py-4 md:py-6 rounded-2xl shadow-lg hover:shadow-xl transition-all min-h-[48px]">
                  כניסה למערכת
                </Button>
              </Link>
            ) : (
              <Link to="/auth?intent=trial">
                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-[#2F3C7E] to-[#4CAF50] hover:from-[#1A2347] hover:to-[#45A049] text-base md:text-lg px-6 md:px-8 py-4 md:py-6 rounded-2xl shadow-lg hover:shadow-xl transition-all min-h-[48px]">
                  התחל בחינם
                </Button>
              </Link>
            )}
            <Button 
              size="lg" 
              variant="outline" 
              className="w-full sm:w-auto text-base md:text-lg px-6 md:px-8 py-4 md:py-6 rounded-2xl border-2 min-h-[48px]"
              onClick={onVideoOpen}
            >
              <Play className="ml-2 h-4 w-4 md:h-5 md:w-5" />
              צפה בסרטון הדגמה
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-2xl mx-auto text-center px-4">
            <div>
              <div className="text-2xl md:text-3xl font-bold text-[#2F3C7E]">500+</div>
              <div className="text-xs md:text-sm text-gray-600">סוחרים פעילים</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-[#4CAF50]">10K+</div>
              <div className="text-xs md:text-sm text-gray-600">לידים מנוהלים</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-[#2F3C7E]">98%</div>
              <div className="text-xs md:text-sm text-gray-600">שביעות רצון</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-[#4CAF50]">24/7</div>
              <div className="text-xs md:text-sm text-gray-600">זמינות</div>
            </div>
          </div>
        </div>

        {/* Hero Image */}
        <div className="mt-8 md:mt-16 relative px-4">
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl p-4 md:p-8 max-w-4xl mx-auto">
            <img 
              src="/placeholder.svg" 
              alt="CarsLead Dashboard" 
              className="w-full rounded-xl md:rounded-2xl shadow-lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

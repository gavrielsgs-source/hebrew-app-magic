
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export function CTASection() {
  return (
    <section className="py-12 md:py-20 bg-gradient-primary w-full">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-3xl mx-auto text-white">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            מוכן להתחיל?
          </h2>
          <p className="text-lg md:text-xl mb-8 opacity-90 px-4">
            הצטרף ל-500+ סוחרי רכב שכבר משתמשים ב-CarsLead
          </p>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 md:p-8 max-w-md mx-auto">
            <div className="bg-green-100 text-green-700 text-sm font-bold px-4 py-2 rounded-full text-center mb-4">
              🎉 14 ימי ניסיון חינם - התחל עכשיו!
            </div>
            
            <div className="space-y-4">
              <Link to="/trial-signup" className="block">
                <Button 
                  size="lg" 
                  className="w-full bg-background text-brand-primary hover:bg-secondary font-bold py-4 md:py-6 rounded-2xl shadow-lg min-h-[48px]"
                >
                  התחל ניסיון חינם ל-14 ימים
                </Button>
              </Link>
            </div>
            
            <div className="flex items-center justify-center mt-6 space-x-reverse space-x-4">
              <CheckCircle className="h-5 w-5 text-green-300" />
              <span className="text-sm opacity-80">גישה מלאה לכל התכונות</span>
            </div>
            
            <div className="flex items-center justify-center mt-2 space-x-reverse space-x-4">
              <CheckCircle className="h-5 w-5 text-green-300" />
              <span className="text-sm opacity-80">חיוב רק לאחר 14 יום</span>
            </div>
            
            <div className="flex items-center justify-center mt-2 space-x-reverse space-x-4">
              <CheckCircle className="h-5 w-5 text-green-300" />
              <span className="text-sm opacity-80">ביטול בכל עת</span>
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
  );
}

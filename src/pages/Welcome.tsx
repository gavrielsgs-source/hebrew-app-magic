
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Car, CheckCircle, ArrowLeft, Zap, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useSubscription } from '@/contexts/subscription-context';

export default function Welcome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { daysLeftInTrial } = useSubscription();

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100" dir="rtl">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#2F3C7E] to-[#4CAF50] rounded-xl flex items-center justify-center">
              <Car className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-[#2F3C7E] to-[#4CAF50] bg-clip-text text-transparent">
              CarsLead
            </span>
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Welcome Message */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 mb-8">
            <div className="mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-[#2F3C7E] to-[#4CAF50] rounded-2xl flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                ברוך הבא ל-CarsLead! 🎉
              </h1>
              
              <p className="text-lg md:text-xl text-gray-600 mb-6">
                החשבון שלך נוצר בהצלחה והניסיון החינם שלך התחיל
              </p>

              {/* Trial Info */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-2xl p-6 mb-8">
                <div className="text-2xl font-bold text-green-700 mb-2">
                  {daysLeftInTrial} ימים נותרו לניסיון החינם
                </div>
                <div className="text-gray-600">
                  גישה מלאה לכל התכונות - ללא כרטיס אשראי, ללא התחייבות
                </div>
              </div>
            </div>

            {/* What's Next */}
            <div className="text-right mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                מה עכשיו?
              </h2>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-blue-50 rounded-2xl p-6">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">התחל לעבוד</h3>
                  <p className="text-gray-600 text-sm">
                    כנס למערכת והתחל להוסיף לידים ורכבים
                  </p>
                </div>
                
                <div className="bg-green-50 rounded-2xl p-6">
                  <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mb-4">
                    <Settings className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">התאם את הפרופיל</h3>
                  <p className="text-gray-600 text-sm">
                    הוסף פרטים אישיים וחברה לחוויה מותאמת
                  </p>
                </div>
                
                <div className="bg-purple-50 rounded-2xl p-6">
                  <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mb-4">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">בחר חבילה</h3>
                  <p className="text-gray-600 text-sm">
                    כשתהיה מוכן, תוכל לבחור חבילה שמתאימה לך
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/dashboard">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto bg-gradient-to-r from-[#2F3C7E] to-[#4CAF50] hover:from-[#1A2347] hover:to-[#45A049] text-lg px-8 py-6 rounded-2xl shadow-lg hover:shadow-xl transition-all"
                >
                  <Zap className="ml-2 h-5 w-5" />
                  כנס למערכת עכשיו
                </Button>
              </Link>
              
              <Link to="/payment">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="w-full sm:w-auto text-lg px-8 py-6 rounded-2xl border-2 hover:bg-gray-50"
                >
                  צפה בחבילות המנוי
                </Button>
              </Link>
            </div>

            {/* Bottom Note */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                💡 טיפ: אתה יכול לבטל בכל רגע ולא תחויב על כלום עד שלא תבחר לשדרג
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

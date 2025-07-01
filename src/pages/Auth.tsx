
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [searchParams] = useSearchParams();
  const intent = searchParams.get('intent');
  const isTrialIntent = intent === 'trial';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100" dir="rtl">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <img 
              src="/lovable-uploads/85996f43-dfa3-4a57-9020-52b4da01c3ad.png" 
              alt="Carslead Software" 
              className="h-16 md:h-20 w-auto object-contain"
            />
          </Link>
          <Link 
            to="/" 
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            חזור לדף הבית
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          {/* Trial Intent Banner */}
          {isTrialIntent && (
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-2xl p-4 mb-6 text-center">
              <div className="text-green-700 font-bold text-lg mb-2">
                🎉 ברוך הבא לניסיון החינם!
              </div>
              <div className="text-sm text-gray-600">
                14 ימים מלאים לנסות את כל האפשרויות - ללא כרטיס אשראי
              </div>
            </div>
          )}

          {/* Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {isLogin ? 'ברוך הבא בחזרה' : 
                 isTrialIntent ? 'התחל את הניסיון החינם שלך' : 'הצטרף למערכת'}
              </h1>
              <p className="text-gray-600">
                {isLogin 
                  ? 'התחבר לחשבון שלך' 
                  : isTrialIntent 
                    ? 'צור חשבון והתחל לנהל את הלידים שלך תוך דקות'
                    : 'צור חשבון חדש והתחל לנהל את הלידים שלך'
                }
              </p>
            </div>

            {/* Form */}
            <div className="space-y-6">
              {isLogin ? <LoginForm /> : <RegisterForm isTrialIntent={isTrialIntent} />}
            </div>

            {/* Toggle */}
            <div className="mt-8 text-center">
              <p className="text-gray-600">
                {isLogin ? (
                  <>
                    אין לך חשבון?{' '}
                    <button
                      onClick={() => setIsLogin(false)}
                      className="text-[#2F3C7E] hover:text-[#4CAF50] font-medium transition-colors"
                    >
                      הירשם עכשיו
                    </button>
                  </>
                ) : (
                  <>
                    כבר יש לך חשבון?{' '}
                    <button
                      onClick={() => setIsLogin(true)}
                      className="text-[#2F3C7E] hover:text-[#4CAF50] font-medium transition-colors"
                    >
                      התחבר כאן
                    </button>
                  </>
                )}
              </p>
            </div>

            {/* Benefits reminder for registration */}
            {!isLogin && (
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl">
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center space-x-reverse space-x-4 text-sm text-gray-600">
                    <span>✓ {isTrialIntent ? "14 ימי ניסיון חינם מלא" : "אין צורך בכרטיס אשראי"}</span>
                  </div>
                  <div className="flex items-center justify-center space-x-reverse space-x-4 text-sm text-gray-600">
                    <span>✓ {isTrialIntent ? "גישה לכל התכונות" : "אפשר לבטל בכל רגע"}</span>
                  </div>
                  <div className="flex items-center justify-center space-x-reverse space-x-4 text-sm text-gray-600">
                    <span>✓ תמיכה מלאה בעברית</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Additional info */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              נתקלת בבעיה? 
              <a href="#" className="text-[#2F3C7E] hover:text-[#4CAF50] mr-1 transition-colors">
                צור קשר עם התמיכה
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

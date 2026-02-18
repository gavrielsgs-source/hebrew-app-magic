
import { Link, useSearchParams } from 'react-router-dom';
import RegisterForm from '@/components/auth/RegisterForm';
import { CheckCircle2 } from 'lucide-react';

export default function Register() {
  const [searchParams] = useSearchParams();
  const isTrialIntent = searchParams.get('trial') === 'true';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-2xl font-bold">
            {isTrialIntent ? 'התחל 14 ימי ניסיון חינם' : 'הרשמה למערכת'}
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {isTrialIntent ? 'צור חשבון והתחל את תקופת הניסיון' : 'צור חשבון חדש'}
          </p>
        </div>

        {/* Trial info banner */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-medium text-sm">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            <span>14 ימי ניסיון חינם!</span>
          </div>
          <p className="text-xs text-green-700 dark:text-green-400 leading-relaxed">
            אנחנו נבקש פרטי אשראי, אך <strong>לא נחייב אותך</strong> ב-14 הימים הראשונים. תוכל לבטל בכל עת דרך עמוד הגדרות המנוי.
          </p>
        </div>

        <RegisterForm isTrialIntent={isTrialIntent} />

        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
          כבר יש לך חשבון?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            התחבר כאן
          </Link>
        </p>
      </div>
    </div>
  );
}

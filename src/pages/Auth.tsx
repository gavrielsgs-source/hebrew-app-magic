
import { useState } from 'react';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-2xl font-bold">
            {isLogin ? 'התחברות למערכת' : 'הרשמה למערכת'}
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {isLogin ? 'ברוך הבא בחזרה' : 'צור חשבון חדש'}
          </p>
        </div>

        {isLogin ? <LoginForm /> : <RegisterForm />}

        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
          {isLogin ? (
            <>
              אין לך חשבון?{' '}
              <button
                onClick={() => setIsLogin(false)}
                className="text-blue-600 hover:underline"
              >
                הירשם עכשיו
              </button>
            </>
          ) : (
            <>
              כבר יש לך חשבון?{' '}
              <button
                onClick={() => setIsLogin(true)}
                className="text-blue-600 hover:underline"
              >
                התחבר כאן
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

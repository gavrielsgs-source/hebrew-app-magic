
import { Link } from 'react-router-dom';
import RegisterForm from '@/components/auth/RegisterForm';

export default function Register() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-2xl font-bold">הרשמה למערכת</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            צור חשבון חדש
          </p>
        </div>

        <RegisterForm isTrialIntent={true} />

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

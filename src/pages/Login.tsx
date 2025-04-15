
import { Link } from 'react-router-dom';
import LoginForm from '@/components/auth/LoginForm';

export default function Login() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-2xl font-bold">התחברות למערכת</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            ברוך הבא בחזרה
          </p>
        </div>

        <LoginForm />

        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
          אין לך חשבון?{' '}
          <Link to="/register" className="text-blue-600 hover:underline">
            הירשם עכשיו
          </Link>
        </p>
      </div>
    </div>
  );
}

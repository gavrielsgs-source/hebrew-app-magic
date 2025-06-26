
import { Car, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface LandingHeaderProps {
  user: any;
  loading: boolean;
}

export function LandingHeader({ user, loading }: LandingHeaderProps) {
  return (
    <header className="container mx-auto px-4 py-4 md:py-6 w-full">
      <nav className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#2F3C7E] to-[#4CAF50] rounded-xl flex items-center justify-center">
            <Car className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-[#2F3C7E] to-[#4CAF50] bg-clip-text text-transparent">
            CarsLead
          </span>
        </div>
        <div className="flex items-center gap-4">
          {loading ? (
            <div className="w-8 h-8 animate-spin border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
          ) : user ? (
            <Link to="/dashboard">
              <Button className="bg-gradient-to-r from-[#2F3C7E] to-[#4CAF50] hover:from-[#1A2347] hover:to-[#45A049] rounded-xl">
                <LogIn className="ml-2 h-4 w-4" />
                כניסה למערכת
              </Button>
            </Link>
          ) : (
            <Link to="/auth">
              <Button variant="outline" className="rounded-xl">
                כניסה למערכת
              </Button>
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}

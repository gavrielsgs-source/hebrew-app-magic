
import { LogIn } from 'lucide-react';
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
        <Link to="/" className="flex items-center">
          <img 
            src="/lovable-uploads/d3acba4a-3358-4ddd-9be5-60dbccd53c94.png" 
            alt="Carslead Software" 
            className="h-12 md:h-14 w-auto"
          />
        </Link>
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

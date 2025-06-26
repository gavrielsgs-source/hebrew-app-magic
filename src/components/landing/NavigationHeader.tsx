
import { useState } from 'react';
import { Car, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';

interface NavigationHeaderProps {
  user: any;
  loading: boolean;
}

export function NavigationHeader({ user, loading }: NavigationHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: 'בית', href: '/' },
    { name: 'למה כדאי', href: '/why-choose-us' },
    { name: 'תכונות', href: '/features' },
    { name: 'צור קשר', href: '/contact' },
  ];

  const isActive = (href: string) => {
    return location.pathname === href;
  };

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50 w-full">
      <div className="container mx-auto px-4">
        <nav className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#2F3C7E] to-[#4CAF50] rounded-xl flex items-center justify-center">
              <Car className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-[#2F3C7E] to-[#4CAF50] bg-clip-text text-transparent">
              CarsLead
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-sm font-medium transition-colors hover:text-[#2F3C7E] ${
                  isActive(item.href) 
                    ? 'text-[#2F3C7E] border-b-2 border-[#2F3C7E] pb-1' 
                    : 'text-gray-600'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Auth Button & Mobile Menu Toggle */}
          <div className="flex items-center gap-4">
            {loading ? (
              <div className="w-8 h-8 animate-spin border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
            ) : user ? (
              <Link to="/dashboard">
                <Button className="bg-gradient-to-r from-[#2F3C7E] to-[#4CAF50] hover:from-[#1A2347] hover:to-[#45A049] rounded-xl">
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

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6 text-gray-600" />
              ) : (
                <Menu className="h-6 w-6 text-gray-600" />
              )}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 bg-white">
            <div className="flex flex-col gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`text-base font-medium transition-colors hover:text-[#2F3C7E] px-4 py-2 rounded-lg ${
                    isActive(item.href) 
                      ? 'text-[#2F3C7E] bg-blue-50' 
                      : 'text-gray-600'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

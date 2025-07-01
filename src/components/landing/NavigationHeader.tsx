
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
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
    <header className="bg-transparent border-b border-white/20 sticky top-0 z-50 w-full backdrop-blur-md">
      <div className="container mx-auto px-4">
        <nav className="flex justify-between items-center h-20 md:h-24">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img 
              src="/lovable-uploads/85996f43-dfa3-4a57-9020-52b4da01c3ad.png" 
              alt="Carslead Software" 
              className="h-48 md:h-64 w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-base font-medium transition-colors hover:text-[#2F3C7E] ${
                  isActive(item.href) 
                    ? 'text-[#2F3C7E]' 
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
          <div className="md:hidden py-4 border-t border-white/20 bg-white/90 backdrop-blur-sm rounded-b-lg">
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


import { Button } from "@/components/ui/button";
import { UserNav } from "@/components/auth/UserNav";
import { NotificationsPopover } from "@/components/notifications/NotificationsPopover";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const CarSleadLogoSVG = () => (
  <svg width="48" height="48" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="80" height="80" rx="10" fill="#1A1F2C"/>
    <path d="M20 40C20 28.9543 28.9543 20 40 20C51.0457 20 60 28.9543 60 40C60 51.0457 51.0457 60 40 60C28.9543 60 20 51.0457 20 40Z" fill="#33C3F0"/>
    <path d="M25 40H55" stroke="white" strokeWidth="3" strokeLinecap="round"/>
    <path d="M35 30L40 35L45 30" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M35 50L40 45L45 50" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export function AppHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo and Title */}
        <div className="flex items-center gap-4">
          <CarSleadLogoSVG />
          <div className="text-right">
            <h1 className="text-2xl font-bold text-[#2F3C7E]">CarsLead</h1>
            <p className="text-sm text-gray-600">מערכת ניהול לסוחרי רכב</p>
          </div>
        </div>

        {/* Desktop Navigation */}
        {!isMobile && (
          <nav className="flex items-center gap-6">
            <Button
              variant="ghost"
              className="text-[#2F3C7E] hover:bg-[#2F3C7E]/10"
              onClick={() => window.location.href = '/'}
            >
              דשבורד
            </Button>
            <Button
              variant="ghost"
              className="text-[#2F3C7E] hover:bg-[#2F3C7E]/10"
              onClick={() => window.location.href = '/leads'}
            >
              לידים
            </Button>
            <Button
              variant="ghost"
              className="text-[#2F3C7E] hover:bg-[#2F3C7E]/10"
              onClick={() => window.location.href = '/cars'}
            >
              רכבים
            </Button>
            <Button
              variant="ghost"
              className="text-[#2F3C7E] hover:bg-[#2F3C7E]/10"
              onClick={() => window.location.href = '/tasks'}
            >
              משימות
            </Button>
            <Button
              variant="ghost"
              className="text-[#2F3C7E] hover:bg-[#2F3C7E]/10"
              onClick={() => window.location.href = '/analytics'}
            >
              אנליטיקה
            </Button>
          </nav>
        )}

        {/* Right side - User actions */}
        <div className="flex items-center gap-2">
          <NotificationsPopover />
          <UserNav />
          
          {/* Mobile menu button */}
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobile && isMobileMenuOpen && (
        <div className="border-t bg-white p-4">
          <nav className="flex flex-col gap-3">
            <Button
              variant="ghost"
              className="text-[#2F3C7E] hover:bg-[#2F3C7E]/10 justify-start"
              onClick={() => {
                window.location.href = '/';
                setIsMobileMenuOpen(false);
              }}
            >
              דשבורד
            </Button>
            <Button
              variant="ghost"
              className="text-[#2F3C7E] hover:bg-[#2F3C7E]/10 justify-start"
              onClick={() => {
                window.location.href = '/leads';
                setIsMobileMenuOpen(false);
              }}
            >
              לידים
            </Button>
            <Button
              variant="ghost"
              className="text-[#2F3C7E] hover:bg-[#2F3C7E]/10 justify-start"
              onClick={() => {
                window.location.href = '/cars';
                setIsMobileMenuOpen(false);
              }}
            >
              רכבים
            </Button>
            <Button
              variant="ghost"
              className="text-[#2F3C7E] hover:bg-[#2F3C7E]/10 justify-start"
              onClick={() => {
                window.location.href = '/tasks';
                setIsMobileMenuOpen(false);
              }}
            >
              משימות
            </Button>
            <Button
              variant="ghost"
              className="text-[#2F3C7E] hover:bg-[#2F3C7E]/10 justify-start"
              onClick={() => {
                window.location.href = '/analytics';
                setIsMobileMenuOpen(false);
              }}
            >
              אנליטיקה
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}

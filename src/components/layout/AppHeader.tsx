
import { useIsMobile } from "@/hooks/use-mobile";
import { NotificationsPopover } from "@/components/notifications/NotificationsPopover";
import { UserNav } from "@/components/auth/UserNav";

const CarSleadLogoSVG = () => (
  <svg width="36" height="36" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="80" height="80" rx="10" fill="#1A1F2C"/>
    <path d="M20 40C20 28.9543 28.9543 20 40 20C51.0457 20 60 28.9543 60 40C60 51.0457 51.0457 60 40 60C28.9543 60 20 51.0457 20 40Z" fill="#33C3F0"/>
    <path d="M25 40H55" stroke="white" strokeWidth="3" strokeLinecap="round"/>
    <path d="M35 30L40 35L45 30" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M35 50L40 45L45 50" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export function AppHeader() {
  const isMobile = useIsMobile();

  return (
    <div className="flex items-center justify-between bg-white/90 backdrop-blur-xl rounded-lg p-2 md:p-4 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2">
        <CarSleadLogoSVG />
        <h1 className={`text-xl font-bold tracking-tight font-rubik text-gray-900 ${isMobile ? 'hidden' : 'block'}`}>
          CarsLead
        </h1>
      </div>
      <div className="flex items-center gap-2">
        {!isMobile && <NotificationsPopover />}
        <UserNav />
      </div>
    </div>
  );
}

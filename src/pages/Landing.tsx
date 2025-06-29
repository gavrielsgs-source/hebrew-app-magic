
import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { NavigationHeader } from '@/components/landing/NavigationHeader';
import { HeroSection } from '@/components/landing/HeroSection';
import { BenefitsSection } from '@/components/landing/BenefitsSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { DemoSection } from '@/components/landing/DemoSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { FAQSection } from '@/components/landing/FAQSection';
import { CTASection } from '@/components/landing/CTASection';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { VideoModal } from '@/components/landing/VideoModal';

export default function Landing() {
  const { user, loading } = useAuth();
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const handlePricingSelect = (plan: string) => {
    // Always redirect to payment page for plan selection
    window.location.href = `/payment?plan=${plan}`;
  };

  const handleVideoOpen = () => {
    setIsVideoModalOpen(true);
  };

  const handleVideoClose = () => {
    setIsVideoModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 w-full overflow-x-hidden" dir="rtl">
      <NavigationHeader user={user} loading={loading} />
      
      <HeroSection user={user} onVideoOpen={handleVideoOpen} />
      
      <BenefitsSection />
      
      <PricingSection 
        user={user} 
        onPricingSelect={handlePricingSelect} 
      />
      
      <DemoSection onVideoOpen={handleVideoOpen} />
      
      <TestimonialsSection />
      
      <FAQSection />
      
      <CTASection />
      
      <LandingFooter />
      
      <VideoModal 
        isOpen={isVideoModalOpen} 
        onClose={handleVideoClose} 
      />
    </div>
  );
}

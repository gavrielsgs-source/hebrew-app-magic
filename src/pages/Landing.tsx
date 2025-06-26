
import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { LandingHeader } from '@/components/landing/LandingHeader';
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
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const { user, loading } = useAuth();

  const handlePricingSelect = (plan: string) => {
    // Always redirect to payment page for plan selection
    window.location.href = `/payment?plan=${plan}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 w-full overflow-x-hidden" dir="rtl">
      <LandingHeader user={user} loading={loading} />
      
      <HeroSection 
        user={user} 
        onVideoOpen={() => setIsVideoOpen(true)} 
      />
      
      <BenefitsSection />
      
      <PricingSection 
        user={user} 
        onPricingSelect={handlePricingSelect} 
      />
      
      <DemoSection onVideoOpen={() => setIsVideoOpen(true)} />
      
      <TestimonialsSection />
      
      <FAQSection />
      
      <CTASection />
      
      <LandingFooter />
      
      <VideoModal 
        isOpen={isVideoOpen} 
        onClose={() => setIsVideoOpen(false)} 
      />
    </div>
  );
}

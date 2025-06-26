
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';

interface DemoSectionProps {
  onVideoOpen: () => void;
}

export function DemoSection({ onVideoOpen }: DemoSectionProps) {
  return (
    <section className="py-12 md:py-20 bg-gradient-to-r from-slate-50 to-blue-50 w-full">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-8">
            ראה את המערכת בפעולה
          </h2>
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-[#2F3C7E] to-[#4CAF50] hover:scale-105 transition-transform rounded-full w-20 h-20"
                onClick={onVideoOpen}
              >
                <Play className="h-8 w-8" />
              </Button>
            </div>
            <p className="mt-6 text-gray-600">
              הדגמה של 60 שניות - איך המערכת עובדת בפועל
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

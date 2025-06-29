
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ExternalLink } from 'lucide-react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VideoModal({ isOpen, onClose }: VideoModalProps) {
  const videoUrl = "https://www.youtube.com/watch?v=tjF7XwzN1Sk";

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl p-4 md:p-8 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl md:text-2xl font-bold">הדגמת המערכת</h3>
          <Button 
            variant="ghost" 
            onClick={onClose}
            className="rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
        </div>
        
        <div className="text-center space-y-4">
          <p className="text-lg font-semibold text-gray-700">
            הסרטון זמין ב-YouTube
          </p>
          <p className="text-gray-600 mb-6">
            לחץ כאן לצפייה בסרטון ההדגמה של 60 שניות
          </p>
          
          <Button 
            onClick={() => window.open(videoUrl, '_blank')}
            className="bg-gradient-to-r from-[#2F3C7E] to-[#4CAF50] hover:from-[#1A2347] hover:to-[#45A049] text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all w-full"
          >
            <ExternalLink className="h-5 w-5 ml-2" />
            צפה ב-YouTube
          </Button>
        </div>
      </div>
    </div>
  );
}

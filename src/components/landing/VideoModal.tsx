
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { extractYouTubeVideoId, generateYouTubeEmbedUrl } from '@/lib/youtube-utils';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VideoModal({ isOpen, onClose }: VideoModalProps) {
  const videoUrl = "https://www.youtube.com/watch?v=tjF7XwzN1Sk";
  const videoId = extractYouTubeVideoId(videoUrl);
  const embedUrl = videoId ? generateYouTubeEmbedUrl(videoId) : null;

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
        className="bg-white rounded-3xl p-4 md:p-8 max-w-5xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 md:mb-6">
          <h3 className="text-xl md:text-2xl font-bold">הדגמת המערכת - 60 שניות</h3>
          <Button 
            variant="ghost" 
            onClick={onClose}
            className="rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
        </div>
        
        <div className="aspect-video bg-gray-100 rounded-2xl overflow-hidden">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title="הדגמת המערכת"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">שגיאה בטעינת הסרטון</p>
            </div>
          )}
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            סרטון הדגמה קצר המציג את יכולות המערכת
          </p>
        </div>
      </div>
    </div>
  );
}

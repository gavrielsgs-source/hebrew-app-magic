
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Clock } from 'lucide-react';
import { extractYouTubeVideoId, generateYouTubeThumbnail } from '@/lib/youtube-utils';

interface DemoSectionProps {
  onVideoOpen: () => void;
}

export function DemoSection({ onVideoOpen }: DemoSectionProps) {
  const [thumbnailLoaded, setThumbnailLoaded] = useState(false);
  const videoUrl = "https://www.youtube.com/watch?v=tjF7XwzN1Sk";
  const videoId = extractYouTubeVideoId(videoUrl);
  const thumbnailUrl = videoId ? generateYouTubeThumbnail(videoId, 'maxres') : null;

  return (
    <section className="py-12 md:py-20 bg-gradient-to-r from-slate-50 to-blue-50 w-full">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            ראה את המערכת בפעולה
          </h2>
          <div className="flex items-center justify-center gap-2 mb-8">
            <Clock className="h-5 w-5 text-[#2F3C7E]" />
            <p className="text-lg text-gray-600 font-medium">
              הדגמה של 60 שניות בלבד
            </p>
          </div>
          
          <div className="bg-white rounded-3xl shadow-2xl p-4 md:p-8">
            <div 
              className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden relative cursor-pointer group transition-all duration-300 hover:shadow-xl"
              onClick={onVideoOpen}
            >
              {/* YouTube Thumbnail */}
              {thumbnailUrl && (
                <img
                  src={thumbnailUrl}
                  alt="תצוגה מקדימה של סרטון ההדגמה"
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                    thumbnailLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={() => setThumbnailLoaded(true)}
                  onError={() => setThumbnailLoaded(false)}
                />
              )}
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-all duration-300" />
              
              {/* Play Button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-[#2F3C7E] to-[#4CAF50] hover:scale-110 transition-all duration-300 rounded-full w-20 h-20 shadow-2xl group-hover:shadow-3xl"
                  onClick={onVideoOpen}
                >
                  <Play className="h-8 w-8 mr-1" />
                </Button>
              </div>

              {/* Duration Badge */}
              <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
                1:00
              </div>
            </div>
            
            <div className="mt-6 space-y-2">
              <p className="text-lg font-semibold text-gray-800">
                גלה איך המערכת חוסכת לך זמן ומגדילה מכירות
              </p>
              <p className="text-gray-600">
                מעקב לידים, ניהול מלאי, שליחת הודעות אוטומטיות ועוד...
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

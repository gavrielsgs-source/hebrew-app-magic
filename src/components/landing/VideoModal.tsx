
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VideoModal({ isOpen, onClose }: VideoModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 max-w-4xl w-full">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold">הדגמת המערכת</h3>
          <Button 
            variant="ghost" 
            onClick={onClose}
            className="rounded-full"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
        </div>
        <div className="aspect-video bg-gray-100 rounded-2xl flex items-center justify-center">
          <p className="text-gray-500">כאן יופיע סרטון ההדגמה</p>
        </div>
      </div>
    </div>
  );
}

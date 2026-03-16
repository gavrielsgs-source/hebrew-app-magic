import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SignaturePad } from './SignaturePad';
import { PenLine, Check } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from '@/hooks/use-toast';

interface SignatureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSignaturesComplete: (signatures: { seller?: string; buyer?: string }) => void;
  existingSignatures?: { seller?: string; buyer?: string };
}

export const SignatureDialog: React.FC<SignatureDialogProps> = ({
  open,
  onOpenChange,
  onSignaturesComplete,
  existingSignatures,
}) => {
  const isMobile = useIsMobile();
  const [sellerSignature, setSellerSignature] = useState<string | undefined>(existingSignatures?.seller);
  const [buyerSignature, setBuyerSignature] = useState<string | undefined>(existingSignatures?.buyer);

  const padWidth = isMobile ? Math.min(window.innerWidth - 80, 340) : 380;
  const padHeight = isMobile ? 160 : 180;

  const handleComplete = () => {
    if (!sellerSignature && !buyerSignature) {
      toast({
        title: 'שגיאה',
        description: 'יש להוסיף לפחות חתימה אחת',
        variant: 'destructive',
      });
      return;
    }
    onSignaturesComplete({
      seller: sellerSignature,
      buyer: buyerSignature,
    });
    onOpenChange(false);
    toast({
      title: 'חתימות נשמרו',
      description: 'החתימות יוטמעו בהסכם',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={isMobile ? 'max-w-[95vw]' : 'max-w-2xl'}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 justify-center text-lg">
            <PenLine className="h-5 w-5" />
            חתימה דיגיטלית על ההסכם
          </DialogTitle>
          <DialogDescription className="text-center">
            חתמו באמצעות האצבע או העכבר על השטח המסומן
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Seller Signature */}
          <div>
            <SignaturePad
              label="חתימת המוכר"
              width={padWidth}
              height={padHeight}
              savedSignature={sellerSignature}
              onSave={(dataUrl) => setSellerSignature(dataUrl)}
              onClear={() => setSellerSignature(undefined)}
            />
            {sellerSignature && (
              <p className="text-xs text-green-600 text-right mt-1 flex items-center gap-1 justify-end">
                <Check className="h-3 w-3" /> חתימת המוכר נשמרה
              </p>
            )}
          </div>

          {/* Buyer Signature */}
          <div>
            <SignaturePad
              label="חתימת הקונה"
              width={padWidth}
              height={padHeight}
              savedSignature={buyerSignature}
              onSave={(dataUrl) => setBuyerSignature(dataUrl)}
              onClear={() => setBuyerSignature(undefined)}
            />
            {buyerSignature && (
              <p className="text-xs text-green-600 text-right mt-1 flex items-center gap-1 justify-end">
                <Check className="h-3 w-3" /> חתימת הקונה נשמרה
              </p>
            )}
          </div>

          {/* Save Button */}
          <Button
            type="button"
            onClick={handleComplete}
            disabled={!sellerSignature && !buyerSignature}
            className="w-full h-12 rounded-xl text-base"
          >
            <Check className="h-5 w-5 ml-2" />
            שמור חתימות והטמע בהסכם
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

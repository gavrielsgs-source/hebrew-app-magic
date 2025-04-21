
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useEffect, useState } from 'react';

export default function PaymentError() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [detailedError, setDetailedError] = useState<string | null>(null);
  
  const errorMessage = searchParams.get('error') || 'חלה שגיאה בתהליך התשלום';
  const errorCode = searchParams.get('code');
  
  useEffect(() => {
    // Get detailed error description based on error code
    if (errorCode) {
      // Here you could map known error codes to more detailed explanations
      switch (errorCode) {
        case 'rejected':
          setDetailedError('העסקה נדחתה על ידי חברת האשראי. נא לבדוק את פרטי הכרטיס או לנסות כרטיס אחר.');
          break;
        case 'expired':
          setDetailedError('תוקף הכרטיס פג. נא להשתמש בכרטיס תקף.');
          break;
        case 'api_error':
          setDetailedError('חלה שגיאת תקשורת מול שרת התשלומים. נא לנסות שוב מאוחר יותר.');
          break;
        default:
          setDetailedError(null);
      }
    }
  }, [errorCode]);

  return (
    <div className="container mx-auto max-w-md py-16 px-4">
      <div className="bg-card border border-destructive/20 rounded-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          <AlertTriangle className="h-16 w-16 text-destructive" />
        </div>
        
        <h1 className="text-2xl font-bold mb-2">שגיאה בתשלום</h1>
        
        <Alert variant="destructive" className="mb-6 text-right">
          <AlertTitle>פרטי השגיאה:</AlertTitle>
          <AlertDescription>
            {errorMessage}
            {errorCode && <div className="text-sm mt-1">קוד שגיאה: {errorCode}</div>}
            {detailedError && <div className="mt-2 text-sm">{detailedError}</div>}
          </AlertDescription>
        </Alert>
        
        <div className="space-y-4">
          <Button 
            className="w-full" 
            onClick={() => navigate('/subscription/upgrade')}
          >
            נסה שוב
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => navigate('/subscription')}
          >
            חזרה לניהול מנוי
          </Button>
          
          <div className="text-xs text-muted-foreground mt-4">
            אם השגיאה ממשיכה להופיע, אנא צור קשר עם התמיכה שלנו.
          </div>
        </div>
      </div>
    </div>
  );
}

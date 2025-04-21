
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function PaymentError() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const errorMessage = searchParams.get('error') || 'חלה שגיאה בתהליך התשלום';
  
  return (
    <div className="container mx-auto max-w-md py-16 px-4">
      <div className="bg-card border border-destructive/20 rounded-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          <AlertTriangle className="h-16 w-16 text-destructive" />
        </div>
        
        <h1 className="text-2xl font-bold mb-2">שגיאה בתשלום</h1>
        
        <p className="text-muted-foreground mb-6">
          {errorMessage}
        </p>
        
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
        </div>
      </div>
    </div>
  );
}

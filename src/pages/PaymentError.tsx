
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertTriangle, HelpCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useEffect, useState } from 'react';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function PaymentError() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [detailedError, setDetailedError] = useState<string | null>(null);
  const [troubleshootingTips, setTroubleshootingTips] = useState<string[]>([]);
  
  // Extract error information from query parameters
  const errorMessage = searchParams.get('error') || 'חלה שגיאה בתהליך התשלום';
  const errorCode = searchParams.get('code');
  const errorDetails = searchParams.get('details');
  
  useEffect(() => {
    // קבלת הסבר מפורט לשגיאה על פי קוד השגיאה
    if (errorCode) {
      switch (errorCode) {
        case 'rejected':
          setDetailedError('העסקה נדחתה על ידי חברת האשראי. נא לבדוק את פרטי הכרטיס או לנסות כרטיס אחר.');
          setTroubleshootingTips([
            'ודא שפרטי הכרטיס הוזנו נכון (מספר, תוקף, CVV)',
            'בדוק שיש מספיק יתרה בכרטיס האשראי',
            'נסה להשתמש בכרטיס אשראי אחר'
          ]);
          break;
        case 'expired':
          setDetailedError('תוקף הכרטיס פג. נא להשתמש בכרטיס תקף.');
          setTroubleshootingTips([
            'השתמש בכרטיס אשראי שטרם פג תוקפו',
            'אם הכרטיס חודש לאחרונה, בדוק עם חברת האשראי שהכרטיס מופעל'
          ]);
          break;
        case '705':
          setDetailedError('מספר תשלומים או מספר תשלומים מקסימלי אינו תקין.');
          setTroubleshootingTips([
            'מספר התשלומים חייב להיות לפחות 1',
            'אם התקלה נמשכת, נסה להסיר את בחירת מספר תשלומים'
          ]);
          break;
        case 'api_error':
          setDetailedError('חלה שגיאת תקשורת מול שרת התשלומים. נא לנסות שוב מאוחר יותר.');
          setTroubleshootingTips([
            'בדוק את חיבור האינטרנט שלך',
            'נסה לרענן את הדף ולבצע את התשלום שוב',
            'ייתכן שקיימת תקלה זמנית בשרת התשלומים'
          ]);
          break;
        case '404':
          setDetailedError('כתובת שרת התשלומים לא נמצאה. ייתכן שיש בעיה בהגדרות או בשרת התשלומים.');
          setTroubleshootingTips([
            'מומלץ לנסות שוב מאוחר יותר',
            'ייתכן שיש בעיה זמנית בשרת התשלומים',
            'אם הבעיה נמשכת, פנה לתמיכה הטכנית'
          ]);
          break;
        default:
          if (errorDetails) {
            setDetailedError(`פרטי שגיאה: ${errorDetails}`);
          } else {
            setDetailedError(`קוד שגיאה לא מוכר: ${errorCode}. נא לנסות שוב או ליצור קשר עם התמיכה.`);
          }
          setTroubleshootingTips([
            'נסה לבצע את התשלום שוב',
            'ודא שפרטי הכרטיס תקינים',
            'בדוק את חיבור האינטרנט',
            'אם הבעיה נמשכת, צור קשר עם התמיכה'
          ]);
      }
    } else if (errorDetails) {
      setDetailedError(`פרטי שגיאה: ${errorDetails}`);
    }
  }, [errorCode, errorDetails]);

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
        
        {troubleshootingTips.length > 0 && (
          <Accordion type="single" collapsible className="mb-6 text-right">
            <AccordionItem value="tips">
              <AccordionTrigger className="flex">
                <HelpCircle className="h-4 w-4 ml-2" />
                טיפים לפתרון הבעיה
              </AccordionTrigger>
              <AccordionContent>
                <ul className="list-disc pr-5 mt-2 text-muted-foreground">
                  {troubleshootingTips.map((tip, index) => (
                    <li key={index} className="mt-1">{tip}</li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
        
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

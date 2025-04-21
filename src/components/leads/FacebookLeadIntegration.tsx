
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Check, Copy, ExternalLink } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function FacebookLeadIntegration() {
  const [fbPageId, setFbPageId] = useState<string>('');
  const [fbAccessToken, setFbAccessToken] = useState<string>('');
  const [fbAppId, setFbAppId] = useState<string>('');
  const [fbAppSecret, setFbAppSecret] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isConfigured, setIsConfigured] = useState<boolean>(false);
  
  // URL של הווהבוק שיש להגדיר בפייסבוק
  const webhookUrl = window.location.origin.includes('localhost') 
    ? 'לא ניתן להשתמש ב-localhost עבור Webhook, יש להשתמש בגרסה המפורסמת של האפליקציה'
    : `https://zjmkdmmnajzevoupgfhg.supabase.co/functions/v1/facebook-leads`;
  
  // מזהה אימות מאובטח אקראי עבור הווהבוק
  const [verifyToken, setVerifyToken] = useState<string>(() => {
    // יצירת מחרוזת אקראית באורך 20 תווים
    return Array.from(crypto.getRandomValues(new Uint8Array(20)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  });
  
  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(message);
    }).catch(() => {
      toast.error('לא ניתן להעתיק לקליפבורד');
    });
  };
  
  const handleSaveConfig = async () => {
    setIsSaving(true);
    
    try {
      // נשמור את ההגדרות באמצעות Edge Function
      // בסביבת ייצור נרצה לשמור את המפתחות הסודיים בצורה מאובטחת
      // ולשלוף אותם בצורה מאובטחת מהשרת
      
      const { data, error } = await supabase.functions.invoke('facebook-leads', {
        body: {
          action: 'saveConfig',
          config: {
            fbPageId,
            fbAccessToken,
            fbAppId,
            fbAppSecret,
            verifyToken
          }
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      setIsConfigured(true);
      toast.success('הגדרות האינטגרציה נשמרו בהצלחה');
    } catch (error) {
      console.error('שגיאה בשמירת הגדרות האינטגרציה:', error);
      toast.error('שגיאה בשמירת הגדרות האינטגרציה');
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>אינטגרציה עם לידים מפייסבוק</CardTitle>
        <CardDescription>
          הגדר את המערכת כדי לקבל לידים אוטומטית מקמפיינים בפייסבוק
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>לפני שמתחילים</AlertTitle>
          <AlertDescription>
            כדי להגדיר את האינטגרציה, יש צורך ביצירת אפליקציית פייסבוק וקבלת הרשאות מתאימות.
            יש לעקוב אחר <a 
              href="https://developers.facebook.com/docs/marketing-api/guides/lead-ads/create/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline text-blue-600 hover:text-blue-800"
            >
              המדריך הרשמי של פייסבוק <ExternalLink className="h-3 w-3 inline" />
            </a>
          </AlertDescription>
        </Alert>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="webhook-url">כתובת Webhook להגדרה בפייסבוק</Label>
            <div className="flex mt-1.5">
              <Input
                id="webhook-url"
                value={webhookUrl}
                disabled
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="ml-2"
                onClick={() => copyToClipboard(webhookUrl, 'הכתובת הועתקה!')}
                disabled={webhookUrl.includes('localhost')}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            {webhookUrl.includes('localhost') && (
              <p className="text-red-500 text-xs mt-1">
                לא ניתן להשתמש בסביבת פיתוח מקומית. פרסם את האפליקציה כדי לקבל כתובת תקפה.
              </p>
            )}
          </div>
          
          <div>
            <Label htmlFor="verify-token">מזהה אימות (Verify Token)</Label>
            <div className="flex mt-1.5">
              <Input
                id="verify-token"
                value={verifyToken}
                onChange={(e) => setVerifyToken(e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="ml-2"
                onClick={() => copyToClipboard(verifyToken, 'המזהה הועתק!')}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              השתמש במזהה זה בהגדרות Webhook באפליקציית הפייסבוק שלך
            </p>
          </div>
          
          <div>
            <Label htmlFor="fb-page-id">מזהה דף פייסבוק</Label>
            <Input
              id="fb-page-id"
              placeholder="לדוגמה: 123456789012345"
              value={fbPageId}
              onChange={(e) => setFbPageId(e.target.value)}
              className="mt-1.5"
            />
          </div>
          
          <div>
            <Label htmlFor="fb-app-id">מזהה אפליקציית פייסבוק</Label>
            <Input
              id="fb-app-id"
              placeholder="לדוגמה: 987654321098765"
              value={fbAppId}
              onChange={(e) => setFbAppId(e.target.value)}
              className="mt-1.5"
            />
          </div>
          
          <div>
            <Label htmlFor="fb-app-secret">סוד אפליקציית פייסבוק</Label>
            <Input
              id="fb-app-secret"
              type="password"
              placeholder="סוד האפליקציה מפייסבוק"
              value={fbAppSecret}
              onChange={(e) => setFbAppSecret(e.target.value)}
              className="mt-1.5"
            />
          </div>
          
          <div>
            <Label htmlFor="fb-access-token">טוקן גישה לפייסבוק (ארוך טווח)</Label>
            <Input
              id="fb-access-token"
              placeholder="טוקן גישה ארוך טווח לפייסבוק"
              value={fbAccessToken}
              onChange={(e) => setFbAccessToken(e.target.value)}
              className="mt-1.5"
            />
            <p className="text-xs text-muted-foreground mt-1">
              <a 
                href="https://developers.facebook.com/docs/facebook-login/guides/access-tokens/get-long-lived" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline text-blue-600 hover:text-blue-800"
              >
                איך להשיג טוקן ארוך טווח? <ExternalLink className="h-3 w-3 inline" />
              </a>
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            window.open('https://developers.facebook.com/apps/', '_blank');
          }}
        >
          מרכז המפתחים של פייסבוק <ExternalLink className="h-4 w-4 ml-2" />
        </Button>
        <Button
          type="button"
          onClick={handleSaveConfig}
          disabled={isSaving || !fbAccessToken || !fbAppId || !fbAppSecret}
        >
          {isSaving ? "שומר..." : isConfigured ? (
            <span className="flex items-center">
              <Check className="h-4 w-4 mr-2" /> הוגדר בהצלחה
            </span>
          ) : "שמור הגדרות"}
        </Button>
      </CardFooter>
    </Card>
  );
}

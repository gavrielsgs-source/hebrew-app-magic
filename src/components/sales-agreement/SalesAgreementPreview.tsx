import React from "react";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface SalesAgreementPreviewProps {
  data: {
    date?: Date;
    seller?: {
      company?: string;
      id?: string;
      phone?: string;
      address?: {
        street?: string;
        city?: string;
        country?: string;
      };
    };
    buyer?: {
      name?: string;
      id?: string;
      phone?: string;
      address?: string;
    };
    car?: {
      make?: string;
      model?: string;
      licenseNumber?: string;
      chassisNumber?: string;
      year?: number;
      mileage?: number;
      hand?: string;
      originality?: string;
    };
    financial?: {
      totalPrice?: number;
      downPayment?: number;
      remainingAmount?: number;
      paymentTerms?: string;
      specialTerms?: string;
    };
  };
}

export function SalesAgreementPreview({ data }: SalesAgreementPreviewProps) {
  const agreementNumber = `SA-${format(data.date || new Date(), "yyyyMMdd")}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

  return (
    <Card className="h-full">
      <CardHeader className="text-center border-b">
        <CardTitle className="text-2xl font-bold">הסכם מכר רכב</CardTitle>
        <p className="text-sm text-muted-foreground">מספר הסכם: {agreementNumber}</p>
        <p className="text-sm">תאריך: {data.date ? format(data.date, "dd MMMM yyyy", { locale: he }) : "_______________"}</p>
      </CardHeader>
      
      <CardContent className="space-y-6 text-sm leading-relaxed">
        {/* פרטי הצדדים */}
        <div className="space-y-4">
          <h3 className="font-bold text-lg text-center">פרטי הצדדים</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="border p-4 rounded">
              <h4 className="font-bold mb-2 text-center">המוכר</h4>
              <div className="space-y-1 text-right">
                <p><strong>שם:</strong> {data.seller?.company || "_______________"}</p>
                <p><strong>ת.ז/ח.פ:</strong> {data.seller?.id || "_______________"}</p>
                <p><strong>טלפון:</strong> {data.seller?.phone || "_______________"}</p>
                <p><strong>כתובת:</strong></p>
                <p className="pr-4">
                  {data.seller?.address?.street || "_______________"}<br/>
                  {data.seller?.address?.city || "_______________"}, {data.seller?.address?.country || "ישראל"}
                </p>
              </div>
            </div>
            
            <div className="border p-4 rounded">
              <h4 className="font-bold mb-2 text-center">הקונה</h4>
              <div className="space-y-1 text-right">
                <p><strong>שם:</strong> {data.buyer?.name || "_______________"}</p>
                <p><strong>ת.ז:</strong> {data.buyer?.id || "_______________"}</p>
                <p><strong>טלפון:</strong> {data.buyer?.phone || "_______________"}</p>
                <p><strong>כתובת:</strong> {data.buyer?.address || "_______________"}</p>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* פרטי הרכב */}
        <div className="space-y-4">
          <h3 className="font-bold text-lg text-center">פרטי הרכב</h3>
          <div className="border p-4 rounded">
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-right">
              <p><strong>יצרן ודגם:</strong> {data.car?.make && data.car?.model ? `${data.car.make} ${data.car.model}` : "_______________"}</p>
              <p><strong>שנת ייצור:</strong> {data.car?.year || "_______________"}</p>
              <p><strong>מספר רישוי:</strong> {data.car?.licenseNumber || "_______________"}</p>
              <p><strong>מספר שילדה:</strong> {data.car?.chassisNumber || "_______________"}</p>
              <p><strong>קילומטרים:</strong> {data.car?.mileage ? data.car.mileage.toLocaleString() : "_______________"}</p>
              <p><strong>יד:</strong> {data.car?.hand || "_______________"}</p>
              <p><strong>מקוריות:</strong> {data.car?.originality || "מקורית"}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* פרטים כספיים */}
        <div className="space-y-4">
          <h3 className="font-bold text-lg text-center">פרטים כספיים</h3>
          <div className="border p-4 rounded">
            <div className="grid grid-cols-1 gap-2 text-right">
              <p><strong>מחיר כולל:</strong> {data.financial?.totalPrice ? `₪${data.financial.totalPrice.toLocaleString()}` : "_______________"}</p>
              <p><strong>מקדמה:</strong> {data.financial?.downPayment ? `₪${data.financial.downPayment.toLocaleString()}` : "_______________"}</p>
              <p><strong>יתרה לתשלום:</strong> {data.financial?.remainingAmount ? `₪${data.financial.remainingAmount.toLocaleString()}` : "_______________"}</p>
              {data.financial?.paymentTerms && (
                <p><strong>תנאי תשלום:</strong> {data.financial.paymentTerms}</p>
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* תנאי ההסכם */}
        <div className="space-y-4">
          <h3 className="font-bold text-lg text-center">תנאי ההסכם</h3>
          
          <div className="space-y-3 text-justify leading-6">
            <div>
              <strong>1. מכירת הרכב:</strong> המוכר מוכר בזאת לקונה את הרכב המפורט לעיל במצבו הנוכחי, וזאת תמורת התמורה הכספית המוגדרת בהסכם זה.
            </div>
            
            <div>
              <strong>2. מחיר ותנאי תשלום:</strong> המחיר הכולל של הרכב הוא כמפורט לעיל. הקונה ישלם את המקדמה בחתימת ההסכם ואת היתרה על פי התנאים המפורטים.
            </div>
            
            <div>
              <strong>3. העברת בעלות:</strong> העברת הבעלות תתבצע בתוך 14 ימי עסקים מיום חתימת ההסכם ותשלום המלא של המחיר. כל העלויות של העברת הבעלות יחולו על הקונה.
            </div>
            
            <div>
              <strong>4. מסירת הרכב:</strong> הרכב יימסר לקונה במועד העברת הבעלות או לפי הסכמה בין הצדדים. עד למועד המסירה האחריות על הרכב חלה על המוכר.
            </div>
            
            <div>
              <strong>5. מצב הרכב:</strong> הקונה מצהיר כי בדק את הרכב ומצא אותו במצב המתאים לו. המכירה נעשית "כפי שהוא" ללא אחריות נוספת מצד המוכר למעט האמור בחוק.
            </div>
            
            <div>
              <strong>6. חובות ועומס:</strong> המוכר מתחייב כי הרכב נקי מכל חוב, משכון, עיקול או עומס אחר ביום מסירתו. במידה ויתגלה חוב, המוכר יהיה אחראי לסילוקו.
            </div>
            
            <div>
              <strong>7. ביטול עסקה:</strong> במקרה של אי עמידה בתנאי התשלום מצד הקונה, יהיה המוכר רשאי לבטל את העסקה ולחלט את המקדמה. הקונה יחזיר את הרכב במצבו המקורי.
            </div>
            
            <div>
              <strong>8. זכויות יוצרים ופטנטים:</strong> המוכר מצהיר כי אין למוכר כל זכות או תביעה נוספת בקשר לרכב למעט האמור בהסכם זה.
            </div>
            
            <div>
              <strong>9. סילוק מחלוקות:</strong> כל מחלוקת שתתגלע בין הצדדים תוכרע בבית המשפט המוסמך לפי הדין הישראלי.
            </div>
            
            <div>
              <strong>10. שינוי ההסכם:</strong> כל שינוי בהסכם זה יעשה בכתב ובחתימת שני הצדדים בלבד.
            </div>
            
            <div>
              <strong>11. תוקף ההסכם:</strong> הסכם זה מהווה את מלוא ההסכמה בין הצדדים ומבטל כל הסכם קודם ביניהם בנושא זה.
            </div>
          </div>
        </div>

        {data.financial?.specialTerms && (
          <>
            <Separator />
            <div className="space-y-2">
              <h3 className="font-bold text-lg text-center">תנאים מיוחדים</h3>
              <div className="border p-4 rounded text-justify">
                {data.financial.specialTerms}
              </div>
            </div>
          </>
        )}

        <Separator />

        {/* חתימות */}
        <div className="space-y-6 mt-12">
          <h3 className="font-bold text-lg text-center">חתימות</h3>
          <div className="grid grid-cols-2 gap-8">
            <div className="text-center space-y-4">
              <div className="h-16 border-b-2 border-gray-300"></div>
              <div>
                <p className="font-bold">המוכר</p>
                <p>{data.seller?.company || "_______________"}</p>
                <p>תאריך: _______________</p>
              </div>
            </div>
            
            <div className="text-center space-y-4">
              <div className="h-16 border-b-2 border-gray-300"></div>
              <div>
                <p className="font-bold">הקונה</p>
                <p>{data.buyer?.name || "_______________"}</p>
                <p>תאריך: _______________</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

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

export const SalesAgreementPreview: React.FC<SalesAgreementPreviewProps> = ({ data }) => {
  return (
    <ScrollArea className="h-[800px] w-full">
      <div 
        id="sales-agreement-preview" 
        className="space-y-4 text-right p-6 bg-background border rounded-lg"
        style={{ 
          direction: 'rtl',
          fontFamily: '"Noto Sans Hebrew", "Rubik", Arial, sans-serif',
          lineHeight: '1.6'
        }}
      >
        {/* Header */}
        <div className="text-center mb-8 border-b pb-4">
          <h1 className="text-3xl font-bold mb-2">הסכם מכר</h1>
          <div className="text-sm text-muted-foreground">
            מס' הסכם: {Date.now().toString().slice(-6)} | תאריך: {data.date ? new Date(data.date).toLocaleDateString('he-IL') : new Date().toLocaleDateString('he-IL')}
          </div>
        </div>

        {/* Agreement Opening */}
        <div className="mb-6">
          <p className="text-base leading-relaxed">
            שנערך ונחתם ב{data.seller?.address?.city || '______'} בתאריך {data.date ? new Date(data.date).toLocaleDateString('he-IL') : new Date().toLocaleDateString('he-IL')}
          </p>
        </div>

        {/* Parties */}
        <div className="grid gap-6 mb-8">
          {/* Seller */}
          <div className="bg-secondary/30 p-4 rounded-lg border">
            <h3 className="text-lg font-semibold mb-3 text-primary">בין:</h3>
            <div className="space-y-1">
              <p><strong>מר {data.seller?.company || '______'}</strong></p>
              <p>ח.פ./ת.ז: {data.seller?.id || '______'}</p>
              <p>טלפון: {data.seller?.phone || '______'}</p>
              <p>כתובת: {data.seller?.address?.street || '______'}, {data.seller?.address?.city || '______'}, {data.seller?.address?.country || '______'}</p>
              <p className="text-sm text-muted-foreground mt-2">להלן: <strong>"המוכר"</strong></p>
            </div>
          </div>

          {/* Buyer */}
          <div className="bg-accent/30 p-4 rounded-lg border">
            <h3 className="text-lg font-semibold mb-3 text-primary">לבין:</h3>
            <div className="space-y-1">
              <p><strong>מר {data.buyer?.name || '______'}</strong></p>
              {data.buyer?.id && <p>ת.ז: {data.buyer.id}</p>}
              {data.buyer?.phone && <p>טלפון: {data.buyer.phone}</p>}
              {data.buyer?.address && <p>כתובת: {data.buyer.address}</p>}
              <p className="text-sm text-muted-foreground mt-2">להלן: <strong>"הקונה"</strong></p>
            </div>
          </div>
        </div>

        {/* Car Details */}
        {data.car && (
          <div className="bg-card border rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold mb-3 text-primary">פרטי הרכב:</h3>
            <p className="mb-3">המוכר הסכים למכור לקונה והקונה הסכים לקנות מהמוכר את הרכב כדלקמן:</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><strong>תוצר:</strong> {data.car.make || '______'}</div>
              <div><strong>דגם:</strong> {data.car.model || '______'}</div>
              <div><strong>שנת ייצור:</strong> {data.car.year || '______'}</div>
              <div><strong>מד קילומטרים:</strong> {(data.car.mileage || 0).toLocaleString()}</div>
              {data.car.licenseNumber && <div><strong>מספר רישוי:</strong> {data.car.licenseNumber}</div>}
              {data.car.chassisNumber && <div><strong>מספר שילדה:</strong> {data.car.chassisNumber}</div>}
              {data.car.hand && <div><strong>יד:</strong> {data.car.hand}</div>}
              {data.car.originality && <div><strong>מקוריות:</strong> {data.car.originality}</div>}
            </div>
            <p className="text-sm text-muted-foreground mt-2">להלן: <strong>"הרכב"</strong></p>
          </div>
        )}

        {/* Financial Terms */}
        <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold mb-3 text-primary">תנאים כספיים:</h3>
          <div className="space-y-2">
            <p><strong>תמורת הרכב ישלם הקונה למוכר:</strong> {(data.financial?.totalPrice || 0).toLocaleString()} ש"ח</p>
            <p><strong>עם חתימת ההסכם:</strong> {(data.financial?.downPayment || 0).toLocaleString()} ש"ח</p>
            {data.financial?.remainingAmount && data.financial.remainingAmount > 0 && (
              <p><strong>יתרה לתשלום:</strong> {data.financial.remainingAmount.toLocaleString()} ש"ח</p>
            )}
            {data.financial?.paymentTerms && (
              <p><strong>תנאי תשלום:</strong> {data.financial.paymentTerms}</p>
            )}
            {data.financial?.specialTerms && (
              <div>
                <p><strong>תנאים מיוחדים:</strong></p>
                <p className="text-sm bg-muted p-2 rounded mt-1">{data.financial.specialTerms}</p>
              </div>
            )}
          </div>
        </div>

        {/* Legal Terms */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-primary border-b pb-2">תנאי ההסכם:</h3>
          
          {[
            "המוכר מצהיר כי לאחר שבדק במשרד הרישוי מצא כי הרכב נקי מכל חוב או שיעבוד או עיקול או צד שלישי כלשהו. היה ומתברר בזמן כלשהו כי על הרכב רובץ מכל הנזכר לעיל, מתחייב המוכר לנקוט בהליכים משפטיים על מנת להמציא לקונה את שחרורו.",
            
            "הרכב הינו רכוש המוכר עד פרעון התשלום האחרון. המוכר שומר לעצמו את הזכות לקחת מהקונה את הרכב ללא הודעה מוקדמת, במידה והקונה לא עמד בתנאי התשלום או המחאותיו לא כובדו על ידי הבנק.",
            
            "הקונה אינו רשאי לבטל את ההסכם, ואולם אם בהסכמת המוכר יבטל הקונה את ההסכם יוחזרו לו הסכומים ששילם ללא הצמדה וריבית, בניכוי הוצאות המוכר.",
            
            "העברת בעלות על שם הקונה עם גמר התשלום. המוכר מתחייב להעביר את הבעלות ברכב לקונה במשרד הרישוי תוך 14 יום מיום קבלת התשלום האחרון.",
            
            "הקונה מצהיר כי המוכר הסביר לו את מצבו הכללי של הרכב ככל הידוע לו, ולאחר שהבין את דבריו, בדק את הרכב ומצא אותו לשביעות רצונו המלאה.",
            
            "כל המיסים והאגרות והקנסות והתשלומים מכל סוג שהוא החלים על הרכב או על השימוש בו, מיום מסירת החזקה ברכב לקונה ואילך, יחולו על הקונה במלואם.",
            
            "הקונה מתחייב להחזיק את הרכב בביטוח מקיף כנגד נזקי צד שלישי ונזקי גוף, וזאת לכל תקופת ההתקשרות. פוליסת הביטוח תציין את זכויות המוכר ברכב.",
            
            "המוכר מתחייב למסור לקונה עם חתימת ההסכם את מפתחות הרכב, רישיון הרכב, תעודת הביטוח התקפה ואישור על תקינות הרכב (במידה וקיים).",
            
            "אם הקונה יפר איזה מתנאי ההסכם, רשאי המוכר לבטל את ההסכם לאלתר ולחזור לחזקת הרכב, וכל סכום ששילם הקונה יישאר בידי המוכר כפיצויים מוסכמים וקבועים מראש.",
            
            "כל שינוי בהסכם זה יהיה תקף רק אם נעשה בכתב ונחתם על ידי שני הצדדים. הסכם זה מבטל כל הסכם או הבנה קודמים בין הצדדים.",
            
            "מקום השיפוט היחיד בכל הנוגע לביצוע או הפרת חוזה זה נקבע בזה בבית המשפט המוסמך במקום מגורי המוכר."
          ].map((term, index) => (
            <div key={index} className="bg-muted/30 p-3 rounded border-r-4 border-r-primary/30">
              <p className="text-sm leading-relaxed">
                <strong>{index + 1}.</strong> {term}
              </p>
            </div>
          ))}
        </div>

        {/* Privacy Notice */}
        <div className="bg-info/10 border border-info/30 rounded-lg p-3 text-xs">
          <p className="mb-1">* אני מאשר בזאת כי המידע שמסרתי ישמר במאגר הלקוחות וייאסף במסגרת התקשרותי עם החברה</p>
          <p>* אני מסכים ומאשר לקבל הטבות עדכונים סקירות מקצועיות והצעות למוצרים ומבצעים או שירותים נוספים באמצעות דוא"ל ומסרונים</p>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-8 mt-8 pt-8 border-t">
          <div className="text-center">
            <div className="border-t border-foreground/30 pt-2 mt-16">
              <p className="text-sm font-semibold">חתימת הקונה</p>
              <p className="text-xs text-muted-foreground">תאריך: _______</p>
            </div>
          </div>
          <div className="text-center">
            <div className="border-t border-foreground/30 pt-2 mt-16">
              <p className="text-sm font-semibold">חתימת המוכר</p>
              <p className="text-xs text-muted-foreground">תאריך: _______</p>
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
};
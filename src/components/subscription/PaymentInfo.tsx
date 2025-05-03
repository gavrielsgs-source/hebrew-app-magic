
import { Check } from "lucide-react";

export function PaymentInfo() {
  return (
    <div className="mt-10 bg-muted/30 rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">מידע נוסף על התשלום</h2>
      <ul className="space-y-2">
        <li className="flex items-start gap-2">
          <Check className="h-4 w-4 text-green-500 mt-1" />
          <span>התשלום חודשי, ניתן לבטל בכל עת</span>
        </li>
        <li className="flex items-start gap-2">
          <Check className="h-4 w-4 text-green-500 mt-1" />
          <span>תמיכה טכנית זמינה 24/7 לכל סוגי המנויים</span>
        </li>
        <li className="flex items-start gap-2">
          <Check className="h-4 w-4 text-green-500 mt-1" />
          <span>נתונים מוצפנים ומאובטחים בתקן בינלאומי</span>
        </li>
        <li className="flex items-start gap-2">
          <Check className="h-4 w-4 text-green-500 mt-1" />
          <span>החזר כספי מלא ב-14 הימים הראשונים, ללא שאלות</span>
        </li>
      </ul>
    </div>
  );
}

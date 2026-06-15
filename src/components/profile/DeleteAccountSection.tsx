import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2, ShieldAlert, Mail } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const SUPPORT_EMAIL = "itscarslead@gmail.com";

/**
 * Data / account deletion section — required by Meta App Review
 * (Apps that access user data must provide a way for users to request deletion).
 */
export function DeleteAccountSection() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    const subject = encodeURIComponent("בקשה למחיקת חשבון ונתונים - CarsLead");
    const body = encodeURIComponent(
      `שלום,\n\nאני מבקש/ת למחוק את חשבוני וכל הנתונים האישיים המשויכים אליו במערכת CarsLead.\n\nפרטי החשבון:\nאימייל: ${user?.email || ""}\nמזהה משתמש: ${user?.id || ""}\n\nאני מאשר/ת כי אני מבין/ה שהפעולה בלתי הפיכה וכי הנתונים יימחקו תוך עד 30 ימי עסקים.\n\nתודה.`,
    );
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
    setOpen(false);
  };

  return (
    <Card className="shadow-lg rounded-2xl border-2 border-destructive/30">
      <CardHeader className="bg-gradient-to-l from-destructive/10 to-transparent border-b pb-4">
        <CardTitle className="text-lg flex items-center gap-2 justify-end text-destructive">
          מחיקת חשבון ונתונים
          <ShieldAlert className="h-5 w-5" />
        </CardTitle>
        <p className="text-sm text-muted-foreground text-right">
          בקשה למחיקה מלאה של החשבון וכל הנתונים האישיים המשויכים אליו במערכת.
        </p>
      </CardHeader>
      <CardContent className="p-4 space-y-4" dir="rtl">
        <div className="text-sm text-foreground/80 space-y-2 text-right">
          <p>
            בהתאם לדרישות Meta ו־GDPR, באפשרותך לבקש בכל עת את מחיקת החשבון שלך
            וכל הנתונים האישיים שנאספו אודותיך — כולל לידים שהתקבלו דרך
            Facebook/Instagram, פרטי לקוחות, רכבים, מסמכים והגדרות.
          </p>
          <p className="font-medium">
            לחיצה על הכפתור תפתח אימייל מוכן לשליחה לכתובת התמיכה{" "}
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="text-primary underline"
              dir="ltr"
            >
              {SUPPORT_EMAIL}
            </a>
            . הבקשה תטופל תוך עד 30 ימי עסקים והפעולה בלתי הפיכה.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:justify-end pt-2 border-t">
          <Button
            type="button"
            variant="outline"
            asChild
            className="h-11 rounded-xl"
          >
            <a href={`mailto:${SUPPORT_EMAIL}`}>
              <Mail className="h-4 w-4 ml-2" />
              יצירת קשר עם התמיכה
            </a>
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="h-11 rounded-xl"
            onClick={() => setOpen(true)}
          >
            <Trash2 className="h-4 w-4 ml-2" />
            בקש מחיקת חשבון ונתונים
          </Button>
        </div>
      </CardContent>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right">
              אישור בקשת מחיקה
            </AlertDialogTitle>
            <AlertDialogDescription className="text-right">
              פעולה זו תפתח אימייל מוכן לשליחה לצוות התמיכה עם בקשה למחיקת
              החשבון וכל הנתונים האישיים המשויכים אליו. לאחר טיפול הבקשה הנתונים
              יימחקו לצמיתות ולא ניתן יהיה לשחזרם. האם להמשיך?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse">
            <AlertDialogAction
              onClick={handleConfirm}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              כן, פתח אימייל בקשה
            </AlertDialogAction>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

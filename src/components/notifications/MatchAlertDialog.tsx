import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Phone } from "lucide-react";

interface LeadMatch {
  id: string;
  name: string;
  phone?: string;
  carInfo: string;
}

export function MatchAlertDialog() {
  const [matches, setMatches] = useState<LeadMatch[]>([]);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleEvent = useCallback((e: Event) => {
    const detail = (e as CustomEvent<LeadMatch[]>).detail;
    if (detail && detail.length > 0) {
      setMatches(detail);
      setOpen(true);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("lead-match-found", handleEvent);
    return () => window.removeEventListener("lead-match-found", handleEvent);
  }, [handleEvent]);

  const handleViewLeads = () => {
    setOpen(false);
    navigate("/leads");
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className="border-2 border-green-500/50 bg-gradient-to-br from-background to-green-500/5 max-w-md" dir="rtl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl flex items-center gap-2 justify-center">
            <span className="text-3xl">🎯</span>
            <span>נמצאה התאמה!</span>
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3 pt-2">
              {matches.map((match, i) => (
                <div
                  key={match.id || i}
                  className="rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-right"
                >
                  <p className="font-semibold text-foreground text-base">
                    {match.name}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    מחפש: {match.carInfo}
                  </p>
                  {match.phone && (
                    <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1 justify-end">
                      <span dir="ltr">{match.phone}</span>
                      <Phone className="h-3 w-3" />
                    </p>
                  )}
                </div>
              ))}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row-reverse gap-2 sm:flex-row-reverse">
          <AlertDialogAction onClick={handleViewLeads}>
            צפה בלידים
          </AlertDialogAction>
          <AlertDialogCancel>סגור</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

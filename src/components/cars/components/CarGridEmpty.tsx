
import { Button } from "@/components/ui/button";
import { FilePlus, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AddCarForm } from "../AddCarForm";
import { useSubscription } from '@/contexts/subscription-context';
import { useCars } from "@/hooks/use-cars";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function CarGridEmpty() {
  const { cars = [] } = useCars();
  const { checkEntitlement } = useSubscription();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { toast } = useToast();
  const canAddCar = checkEntitlement('carLimit', cars.length + 1);

  const onCarAdded = () => {
    setShowAddDialog(false);
    toast({
      title: "רכב נוסף",
      description: "הרכב נוסף בהצלחה למלאי!",
    });
  };

  return (
    <div className="text-center py-12 px-4">
      <div className="mx-auto rounded-full w-12 h-12 flex items-center justify-center bg-muted mb-4">
        <Plus className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-1">אין רכבים במלאי</h3>
      <p className="text-muted-foreground mb-4">
        התחל להוסיף רכבים למלאי שלך כדי לראות אותם כאן
      </p>
      <div className="flex flex-col sm:flex-row gap-2 justify-center">
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>הוסף רכב חדש</Button>
          </DialogTrigger>
          <DialogContent className="w-[95%] sm:w-[600px] overflow-y-auto max-h-[90vh]" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-right">הוסף רכב חדש</DialogTitle>
            </DialogHeader>
            
            {!canAddCar ? (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-600 text-right">
                  הגעת למגבלת המנוי. לא ניתן להוסיף עוד רכבים. אנא שדרג את המנוי שלך.
                </AlertDescription>
              </Alert>
            ) : (
              <AddCarForm onSuccess={onCarAdded} />
            )}
          </DialogContent>
        </Dialog>
        
        <Button variant="outline" asChild>
          <Link to="/documents">
            <FilePlus className="h-4 w-4 ml-2" />
            ניהול מסמכים
          </Link>
        </Button>
      </div>
    </div>
  );
}

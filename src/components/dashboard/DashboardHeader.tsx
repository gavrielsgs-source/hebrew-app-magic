import { LayoutDashboard } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function DashboardHeader() {
  const navigate = useNavigate();

  return (
    <Card className="shadow-lg rounded-2xl border-0 overflow-hidden">
      <div className="bg-gradient-to-l from-primary to-primary/80 p-6">
        <div className="flex items-center justify-between">
          <div className="text-primary-foreground text-right">
            <h1 className="text-2xl font-bold mb-1">סיכום מהיר</h1>
            <p className="text-primary-foreground/80 text-sm">
              המבט הכולל של העסק שלך במקום אחד
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate("/analytics")}
              className="bg-white/20 hover:bg-white/30 text-primary-foreground border-0 rounded-xl px-6"
            >
              נתח נתונים
            </Button>
            <div className="h-14 w-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <LayoutDashboard className="h-7 w-7 text-primary-foreground" />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

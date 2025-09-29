
import { BarChart3 } from "lucide-react";
import { StandardPageHeader } from "@/components/common/StandardPageHeader";
import { useNavigate } from "react-router-dom";

export function DashboardHeader() {
  const navigate = useNavigate();

  return (
    <StandardPageHeader
      title="סיכום מהיר"
      subtitle="המבט הכולל של העסק שלך במקום אחד"
      icon={BarChart3}
      actionButton={{
        label: "נתח נתונים",
        onClick: () => navigate("/analytics"),
        className: "bg-gradient-to-r from-[#4CAF50] to-[#45A049] hover:from-[#388E3C] hover:to-[#2E7D32] text-white shadow-lg px-6 py-3 text-base font-semibold"
      }}
    />
  );
}

import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { GenerateReportRequest, GenerateReportResponse } from "@/types/accountant-report";

export function useGenerateAccountantReport() {
  return useMutation({
    mutationFn: async (request: GenerateReportRequest): Promise<GenerateReportResponse> => {
      console.log("🔄 Generating accountant report...", request);

      const { data, error } = await supabase.functions.invoke("generate-accountant-report", {
        body: request,
      });

      if (error) {
        console.error("❌ Error generating report:", error);
        throw error;
      }

      if (!data.success) {
        throw new Error("Failed to generate report");
      }

      console.log("✅ Report generated successfully:", data);
      return data as GenerateReportResponse;
    },
    onSuccess: (data) => {
      const warningCount = data.validationErrors.length;
      if (warningCount > 0) {
        toast.warning(`הדוח נוצר בהצלחה עם ${warningCount} אזהרות`, {
          description: "יש נתונים חסרים שכדאי להשלים",
        });
      } else {
        toast.success("הדוח נוצר בהצלחה!", {
          description: "הדוח מוכן להורדה או שליחה לרואה החשבון",
        });
      }
    },
    onError: (error: Error) => {
      console.error("Error generating report:", error);
      toast.error("שגיאה ביצירת הדוח", {
        description: error.message || "אנא נסה שוב",
      });
    },
  });
}

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileContainer } from "@/components/mobile/MobileContainer";
import { MobileDocumentHeader } from "@/components/mobile/MobileDocumentHeader";

export default function DocumentProductionWelcome() {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <MobileContainer withBottomNav={true}>
        <MobileDocumentHeader 
          title="הפקת מסמכים"
          icon={<FileText className="h-5 w-5" />}
        />
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-right flex items-center gap-2">
                <FileText className="h-6 w-6" />
                ברוכים הבאים להפקת מסמכים
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-right space-y-3">
                <p>בחרו סוג מסמך מתפריט הצד כדי להתחיל.</p>
                <p className="text-muted-foreground">הפיצ׳ר בגרסת BETA — נשמח למשוב.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </MobileContainer>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-right flex items-center gap-2">
            <FileText className="h-6 w-6" />
            ברוכים הבאים להפקת מסמכים
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-right space-y-3">
            <p>בחרו סוג מסמך מתפריט הצד כדי להתחיל.</p>
            <p className="text-muted-foreground">הפיצ׳ר בגרסת BETA — נשמח למשוב.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { Card, CardContent } from "@/components/ui/card";
import { Send, Image } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface WhatsappTemplatePreviewProps {
  template: string;
  images?: string[];
  loadingImages?: boolean;
  onEdit: () => void;
}

export function WhatsappTemplatePreview({ template, images = [], loadingImages = false, onEdit }: WhatsappTemplatePreviewProps) {
  // Split the template by new lines and render each line
  const lines = template.split('\n');
  
  return (
    <div className="space-y-4 pt-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-green-700">תצוגה מקדימה של ההודעה</h3>
        <Send className="h-4 w-4 text-green-600" />
      </div>
      
      <Card className="border-green-500 bg-green-50">
        <CardContent className="pt-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="space-y-2">
              {lines.map((line, index) => {
                // Check for bold text format with asterisks
                if (line.includes('*')) {
                  // Handle asterisk-based formatting
                  const parts = line.split(/(\*[^*]+\*)/g);
                  return (
                    <p key={index} className={line.trim() === "" ? "h-2" : ""}>
                      {parts.map((part, i) => {
                        if (part.startsWith('*') && part.endsWith('*')) {
                          return <strong key={i}>{part.substring(1, part.length - 1)}</strong>;
                        }
                        return part;
                      })}
                    </p>
                  );
                }
                return (
                  <p key={index} className={line.trim() === "" ? "h-2" : ""}>
                    {line}
                  </p>
                );
              })}
            </div>
            
            {/* Image previews */}
            {loadingImages ? (
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-green-700">
                  <Image className="h-4 w-4" />
                  <span>טוען תמונות...</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Skeleton className="h-20 w-full rounded-md" />
                  <Skeleton className="h-20 w-full rounded-md" />
                </div>
              </div>
            ) : images && images.length > 0 ? (
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-green-700">
                  <Image className="h-4 w-4" />
                  <span>{images.length} תמונות לשליחה</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {images.slice(0, 4).map((src, idx) => (
                    <div key={idx} className="relative aspect-video rounded-lg border overflow-hidden bg-muted">
                      <img
                        src={src}
                        alt={`תמונת רכב ${idx + 1}`}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ))}
                  {images.length > 4 && (
                    <div className="relative aspect-video rounded-lg border overflow-hidden bg-muted bg-opacity-80 flex items-center justify-center">
                      <span className="text-sm font-medium">+{images.length - 4} תמונות נוספות</span>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
      
      {images && images.length > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          שים לב: התמונות יישלחו בנפרד לאחר ההודעה הראשית
        </p>
      )}
    </div>
  );
}

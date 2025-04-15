
import { Card, CardContent } from "@/components/ui/card";
import { Send } from "lucide-react";

interface WhatsappTemplatePreviewProps {
  template: string;
  onEdit: () => void;
}

export function WhatsappTemplatePreview({ template, onEdit }: WhatsappTemplatePreviewProps) {
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

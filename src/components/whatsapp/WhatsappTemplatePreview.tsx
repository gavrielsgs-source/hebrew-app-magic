
import { Card, CardContent } from "@/components/ui/card";

interface WhatsappTemplatePreviewProps {
  template: string;
  onEdit: () => void;
}

export function WhatsappTemplatePreview({ template, onEdit }: WhatsappTemplatePreviewProps) {
  // Split the template by new lines and render each line
  const lines = template.split('\n');
  
  return (
    <div className="space-y-4 pt-4">
      <Card className="border-green-500 bg-green-50">
        <CardContent className="pt-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="space-y-2">
              {lines.map((line, index) => (
                <p key={index} className={line.trim() === "" ? "h-2" : ""}>
                  {line}
                </p>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

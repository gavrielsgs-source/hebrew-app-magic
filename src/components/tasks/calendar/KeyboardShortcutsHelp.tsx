
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Keyboard } from "lucide-react";

export function KeyboardShortcutsHelp() {
  const shortcuts = [
    { keys: ['1'], description: 'תצוגת שבוע' },
    { keys: ['2'], description: 'תצוגת חודש' },
    { keys: ['3'], description: 'תצוגת רשימה' },
    { keys: ['←'], description: 'תקופה קודמת' },
    { keys: ['→'], description: 'תקופה הבאה' },
    { keys: ['T'], description: 'חזור להיום' },
    { keys: ['?'], description: 'הצג/הסתר עזרה' }
  ];

  return (
    <Card className="w-72 bg-white/95 backdrop-blur-sm border-gray-200 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Keyboard className="h-4 w-4" />
          קיצורי מקלדת
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {shortcuts.map((shortcut, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{shortcut.description}</span>
            <div className="flex gap-1">
              {shortcut.keys.map((key, keyIndex) => (
                <Badge 
                  key={keyIndex} 
                  variant="outline" 
                  className="px-2 py-1 text-xs font-mono bg-gray-50"
                >
                  {key}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

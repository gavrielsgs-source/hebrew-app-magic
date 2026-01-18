
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
    <Card className="w-80 bg-card/95 backdrop-blur-md border-2 border-border/50 shadow-2xl rounded-2xl">
      <CardHeader className="pb-4 border-b border-border/30 bg-muted/30">
        <CardTitle className="flex items-center gap-2.5 text-base font-bold text-foreground">
          <div className="p-2 bg-primary/10 rounded-xl">
            <Keyboard className="h-5 w-5 text-primary" />
          </div>
          קיצורי מקלדת
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        {shortcuts.map((shortcut, index) => (
          <div key={index} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-muted/50 transition-colors">
            <span className="text-sm text-muted-foreground font-medium">{shortcut.description}</span>
            <div className="flex gap-1.5">
              {shortcut.keys.map((key, keyIndex) => (
                <Badge 
                  key={keyIndex} 
                  variant="outline" 
                  className="px-3 py-1.5 text-xs font-mono font-bold bg-muted/50 border-2 rounded-lg"
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

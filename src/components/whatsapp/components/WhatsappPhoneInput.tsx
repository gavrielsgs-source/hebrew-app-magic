
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WhatsappLeadSelector } from "./WhatsappLeadSelector";

interface WhatsappPhoneInputProps {
  phoneNumber: string;
  setPhoneNumber: (value: string) => void;
  selectedLeadId?: string;
  selectedLeadName?: string;
  onLeadSelect?: (leadId: string, phone: string, name: string) => void;
  onClearLead?: () => void;
}

export function WhatsappPhoneInput({ 
  phoneNumber, 
  setPhoneNumber, 
  selectedLeadId,
  selectedLeadName,
  onLeadSelect,
  onClearLead 
}: WhatsappPhoneInputProps) {
  return (
    <div>
      <Tabs defaultValue="existing" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="existing">לקוח קיים</TabsTrigger>
          <TabsTrigger value="manual">מספר ידני</TabsTrigger>
        </TabsList>
        
        <TabsContent value="existing" className="space-y-3">
          {onLeadSelect && (
            <WhatsappLeadSelector
              selectedLeadId={selectedLeadId}
              onLeadSelect={onLeadSelect}
              onNewLead={() => {
                // Switch to manual tab when adding new lead
                const manualTab = document.querySelector('[value="manual"]') as HTMLElement;
                manualTab?.click();
              }}
            />
          )}
          
          {selectedLeadId && selectedLeadName && (
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-sm">
                <div className="font-medium text-green-800">לקוח נבחר: {selectedLeadName}</div>
                <div className="text-green-600">{phoneNumber}</div>
              </div>
              {onClearLead && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onClearLead}
                  className="text-green-700 hover:text-green-800"
                >
                  בטל
                </Button>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="manual" className="space-y-3">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-1">
              מספר טלפון של הלקוח
            </label>
            <input
              id="phone"
              type="tel"
              placeholder="דוגמה: 0541234567"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={phoneNumber}
              onChange={(e) => {
                setPhoneNumber(e.target.value);
                // Clear selected lead when typing manually
                if (onClearLead) {
                  onClearLead();
                }
              }}
              dir="rtl"
            />
            <p className="text-xs text-muted-foreground mt-1">
              ניתן להזין עם או בלי קידומת (972)
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

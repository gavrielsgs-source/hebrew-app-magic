
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WhatsappLeadSelector } from "./WhatsappLeadSelector";
import { useState } from "react";

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
  const [activeTab, setActiveTab] = useState("existing");

  const handleNewLead = () => {
    // Switch to manual tab when adding new lead
    setActiveTab("manual");
  };

  const handlePhoneNumberChange = (value: string) => {
    setPhoneNumber(value);
    // Clear selected lead when typing manually
    if (onClearLead) {
      onClearLead();
    }
  };

  return (
    <div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="existing">לקוח קיים</TabsTrigger>
          <TabsTrigger value="manual">מספר ידני</TabsTrigger>
        </TabsList>
        
        <TabsContent value="existing" className="space-y-3">
          {onLeadSelect && (
            <WhatsappLeadSelector
              selectedLeadId={selectedLeadId}
              onLeadSelect={onLeadSelect}
              onNewLead={handleNewLead}
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
            <Input
              id="phone"
              type="tel"
              placeholder="דוגמה: 0541234567"
              value={phoneNumber}
              onChange={(e) => handlePhoneNumberChange(e.target.value)}
              className="text-right"
              dir="ltr"
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

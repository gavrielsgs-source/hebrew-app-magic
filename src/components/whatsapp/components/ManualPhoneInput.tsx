
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Send, Phone } from "lucide-react";
import { toast } from "sonner";

interface ManualPhoneInputProps {
  onSendMessage: (phone: string, message: string) => void;
  defaultMessage: string;
}

export function ManualPhoneInput({ onSendMessage, defaultMessage }: ManualPhoneInputProps) {
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState(defaultMessage);
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!phone.trim()) {
      toast.error("אנא הכנס מספר טלפון");
      return;
    }

    if (!message.trim()) {
      toast.error("אנא הכנס הודעה");
      return;
    }

    setIsSending(true);
    try {
      await onSendMessage(phone, message);
      setPhone("");
      toast.success("ההודעה נשלחה בהצלחה");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("שגיאה בשליחת ההודעה");
    } finally {
      setIsSending(false);
    }
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-numeric characters
    const numbers = value.replace(/\D/g, '');
    
    // Format as Israeli phone number
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 6) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else if (numbers.length <= 10) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6)}`;
    } else {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-gray-50" dir="rtl">
      <div className="flex items-center gap-2 mb-3">
        <Phone className="h-5 w-5 text-blue-600" />
        <h3 className="font-semibold text-gray-900">שליחה למספר ספציפי</h3>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="manual-phone" className="text-sm font-medium">
          מספר טלפון
        </Label>
        <Input
          id="manual-phone"
          type="tel"
          value={phone}
          onChange={handlePhoneChange}
          placeholder="050-123-4567"
          className="text-right"
          dir="rtl"
        />
        <p className="text-xs text-gray-500">
          הכנס מספר טלפון בפורמט: 050-123-4567
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="manual-message" className="text-sm font-medium">
          הודעה
        </Label>
        <textarea
          id="manual-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="הכנס את ההודעה שלך כאן..."
          className="w-full p-3 border border-gray-300 rounded-lg resize-none text-right"
          rows={4}
          dir="rtl"
        />
      </div>

      <Button
        onClick={handleSend}
        disabled={isSending || !phone.trim() || !message.trim()}
        className="w-full bg-green-600 hover:bg-green-700 text-white"
      >
        <Send className="h-4 w-4 ml-2" />
        {isSending ? "שולח..." : "שלח הודעה"}
      </Button>
    </div>
  );
}

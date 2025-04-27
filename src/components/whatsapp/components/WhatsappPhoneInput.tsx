
import { Input } from "@/components/ui/input";

interface WhatsappPhoneInputProps {
  phoneNumber: string;
  setPhoneNumber: (value: string) => void;
}

export function WhatsappPhoneInput({ phoneNumber, setPhoneNumber }: WhatsappPhoneInputProps) {
  return (
    <div>
      <label htmlFor="phone" className="block text-sm font-medium mb-1">
        מספר טלפון של הלקוח
      </label>
      <div className="flex gap-2">
        <input
          id="phone"
          type="tel"
          placeholder="דוגמה: 0541234567"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          dir="rtl"
        />
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        ניתן להזין עם או בלי קידומת (972)
      </p>
    </div>
  );
}

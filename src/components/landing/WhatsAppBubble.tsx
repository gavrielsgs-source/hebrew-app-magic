import { MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER = "972502710262";
const DEFAULT_MESSAGE = "היי, אני מתעניין/ת במערכת CarsLead 🚗";

export function WhatsAppBubble() {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="צור קשר בוואטסאפ"
      className="fixed bottom-6 left-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform duration-300 hover:scale-110 hover:shadow-xl animate-in fade-in slide-in-from-bottom-4"
    >
      <MessageCircle className="h-7 w-7 fill-white stroke-white" />
    </a>
  );
}

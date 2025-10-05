
import { Card, CardContent } from "@/components/ui/card";
import { LeadCardHeader } from "./components/LeadCardHeader";
import { LeadCardContent } from "./components/LeadCardContent";
import { LeadCardActions } from "./components/LeadCardActions";
import { useToast } from "@/hooks/use-toast";

interface LeadCardProps {
  lead: any;
}

export function LeadCard({ lead }: LeadCardProps) {
  const { toast } = useToast();

  const handleEdit = () => {
    console.log('Edit action triggered for lead:', lead.id);
  };

  const handleDelete = () => {
    console.log('Delete action triggered for lead:', lead.id);
  };

  const handleWhatsApp = () => {
    console.log('WhatsApp action triggered for lead:', lead.id);
  };

  const handleSchedule = () => {
    console.log('Schedule action triggered for lead:', lead.id);
  };

    const name_keys = ["full_name", "first_name"]
  const phone_keys = ["phone", "phone_number"];
   const leadFields = lead.lead_data.field_data;
  const nameField = leadFields.find((f) => name_keys.includes(f.name));
  const phoneField = leadFields.find((f) => phone_keys.includes(f.name));
  const emailField = leadFields.find((f) => f.name === "email");

  return (
    <Card className="lead-enhanced leads-card group overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 rounded-3xl border border-primary/10 bg-gradient-to-br from-background/95 via-background/90 to-background/85 backdrop-blur-md hover:scale-[1.02] hover:border-primary/20 animate-fade-in">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <LeadCardHeader lead={lead} />
      <CardContent className="relative z-10 p-8">
        <div className="transform transition-transform duration-300 group-hover:translate-y-[-2px]">
          <LeadCardContent lead={lead} />
          <div className="mt-8 transform transition-all duration-300 group-hover:translate-y-[-1px]">
            <LeadCardActions
              leadId={lead.lead_id as string}
              leadName={nameField.values.join(",") as string}
              leadPhone={phoneField.values.join(",") as string}
              leadSource={lead.source as string}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onWhatsApp={handleWhatsApp}
              onSchedule={handleSchedule}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

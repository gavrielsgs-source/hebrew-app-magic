
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

  return (
    <Card className="lead-enhanced leads-card overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-300 rounded-3xl border-0 bg-white/90 backdrop-blur-sm">
      <LeadCardHeader lead={lead} />
      <CardContent className="p-8">
        <LeadCardContent lead={lead} />
        <div className="mt-8">
          <LeadCardActions
            leadId={lead.id as string}
            leadName={lead.name as string}
            leadPhone={lead.phone as string}
            leadSource={lead.source as string}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onWhatsApp={handleWhatsApp}
            onSchedule={handleSchedule}
          />
        </div>
      </CardContent>
    </Card>
  );
}

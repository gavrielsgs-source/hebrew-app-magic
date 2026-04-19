import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  useAttributionForLead,
  useEnhancedFlagState,
} from "@/hooks/attribution/use-attribution";
import { AttributionDebuggerCard } from "./AttributionDebuggerCard";
import { AttributionOverrideForm } from "./AttributionOverrideForm";
import { AttributionTimeline } from "./AttributionTimeline";
import { EnhancedFlagPanel } from "./EnhancedFlagPanel";
import {
  AdMetadataPanel,
  AttributionExplanation,
  InstagramLinkagePanel,
} from "./FuturePanels";
import { useRealAdminCheck } from "@/hooks/use-real-admin-check";

/**
 * Admin-only per-lead drawer combining all internal attribution tools.
 * Mounted from the Leads page row actions (admin guard inside).
 */
export function AttributionAdminDrawer({
  open, onOpenChange, leadRefId, ownerUserId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  leadRefId: string;
  ownerUserId: string;
}) {
  const { isAdmin } = useRealAdminCheck();
  const { data: row } = useAttributionForLead(leadRefId);
  const { data: flag } = useEnhancedFlagState();
  if (!isAdmin) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Internal attribution tools</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-4">
          <EnhancedFlagPanel />
          <AttributionDebuggerCard row={row} enhancedActive={!!flag?.per_user} />
          <AttributionOverrideForm
            leadRefId={leadRefId}
            ownerUserId={ownerUserId}
            current={row?.override_value ?? null}
          />
          <AttributionTimeline leadRefId={leadRefId} />
          <InstagramLinkagePanel />
          <AdMetadataPanel adId={row?.ad_id ?? null} />
          <AttributionExplanation display={row?.lead_source_display ?? null} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

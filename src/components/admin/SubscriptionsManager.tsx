import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminSubscriptions } from "@/hooks/use-admin-subscriptions";
import { SubscriptionStatsCards } from "./SubscriptionStatsCards";
import { SubscriptionFilters } from "./SubscriptionFilters";
import { SubscriptionTable } from "./SubscriptionTable";
import { SubscriptionAnalytics } from "./SubscriptionAnalytics";
import { Loader2 } from "lucide-react";

export function SubscriptionsManager() {
  const {
    subscriptions,
    stats,
    timeline,
    isLoading,
    extendSubscription,
    changeStatus,
    changeTier,
    changeLeadLimit,
  } = useAdminSubscriptions();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tierFilter, setTierFilter] = useState("all");

  // סינון המנויים
  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((sub) => {
      const matchesSearch =
        searchTerm === "" ||
        sub.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.full_name?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || sub.subscription_status === statusFilter;

      const matchesTier =
        tierFilter === "all" || sub.subscription_tier === tierFilter;

      return matchesSearch && matchesStatus && matchesTier;
    });
  }, [subscriptions, searchTerm, statusFilter, tierFilter]);

  const handleExtend = (subscriptionId: string, days: number, reason?: string) => {
    extendSubscription.mutate({ subscriptionId, days, reason });
  };

  const handleChangeStatus = (subscriptionId: string, newStatus: string, reason?: string) => {
    changeStatus.mutate({ subscriptionId, newStatus, reason });
  };

  const handleChangeTier = (subscriptionId: string, newTier: string, reason?: string) => {
    changeTier.mutate({ subscriptionId, newTier, reason });
  };

  const handleChangeLeadLimit = (subscriptionId: string, maxLeads: number | null) => {
    changeLeadLimit.mutate({ subscriptionId, maxLeads });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* כרטיסי סטטיסטיקות */}
      <SubscriptionStatsCards stats={stats} />

      {/* גרפים ואנליטיקה */}
      <SubscriptionAnalytics timeline={timeline} />

      {/* טבלת מנויים */}
      <Card>
        <CardHeader>
          <CardTitle className="text-right">ניהול מנויים</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <SubscriptionFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            tierFilter={tierFilter}
            onTierChange={setTierFilter}
          />

          <SubscriptionTable
            subscriptions={filteredSubscriptions}
            onExtend={handleExtend}
            onChangeStatus={handleChangeStatus}
            onChangeTier={handleChangeTier}
            onChangeLeadLimit={handleChangeLeadLimit}
            isLoading={
              extendSubscription.isPending ||
              changeStatus.isPending ||
              changeTier.isPending ||
              changeLeadLimit.isPending
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}

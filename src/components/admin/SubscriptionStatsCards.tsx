import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, UserX, TrendingUp, DollarSign, Clock } from "lucide-react";
import { SubscriptionStats } from "@/hooks/use-admin-subscriptions";

interface SubscriptionStatsCardsProps {
  stats?: SubscriptionStats;
}

export function SubscriptionStatsCards({ stats }: SubscriptionStatsCardsProps) {
  if (!stats) return null;

  const cards = [
    {
      title: "סה\"כ מנויים",
      value: stats.total_subscriptions,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "מנויים פעילים",
      value: stats.active_subscriptions,
      icon: UserCheck,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "בניסיון",
      value: stats.trial_subscriptions,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "פג תוקף",
      value: stats.expired_subscriptions,
      icon: UserX,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "MRR (חודשי)",
      value: `₪${stats.mrr.toLocaleString()}`,
      icon: DollarSign,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "ARR (שנתי)",
      value: `₪${stats.arr.toLocaleString()}`,
      icon: TrendingUp,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-right">{card.title}</CardTitle>
              <div className={`${card.bgColor} p-2 rounded-full`}>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-right">{card.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

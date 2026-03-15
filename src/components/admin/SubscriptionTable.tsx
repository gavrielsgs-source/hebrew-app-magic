import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Edit, ArrowUpDown, Download, Mail, Phone, Users } from "lucide-react";
import { AdminSubscription } from "@/hooks/use-admin-subscriptions";
import { ExtendSubscriptionDialog } from "./ExtendSubscriptionDialog";
import { ChangeStatusDialog } from "./ChangeStatusDialog";
import { ChangeTierDialog } from "./ChangeTierDialog";
import { ChangeLeadLimitDialog } from "./ChangeLeadLimitDialog";
import { formatDistanceToNow } from "date-fns";
import { he } from "date-fns/locale";
import * as XLSX from "xlsx";

interface SubscriptionTableProps {
  subscriptions: AdminSubscription[];
  onExtend: (subscriptionId: string, days: number, reason?: string) => void;
  onChangeStatus: (subscriptionId: string, newStatus: string, reason?: string) => void;
  onChangeTier: (subscriptionId: string, newTier: string, reason?: string) => void;
  onChangeLeadLimit: (subscriptionId: string, maxLeads: number | null) => void;
  isLoading?: boolean;
}

export function SubscriptionTable({
  subscriptions,
  onExtend,
  onChangeStatus,
  onChangeTier,
  onChangeLeadLimit,
  isLoading,
}: SubscriptionTableProps) {
  const [selectedSubscription, setSelectedSubscription] = useState<AdminSubscription | null>(null);
  const [extendDialogOpen, setExtendDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [tierDialogOpen, setTierDialogOpen] = useState(false);
  const [leadLimitDialogOpen, setLeadLimitDialogOpen] = useState(false);
  const [sortField, setSortField] = useState<keyof AdminSubscription>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const handleSort = (field: keyof AdminSubscription) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const sortedSubscriptions = [...subscriptions].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (aValue === null) return 1;
    if (bValue === null) return -1;
    
    if (sortDirection === "asc") {
      return aValue < bValue ? -1 : 1;
    }
    return aValue > bValue ? -1 : 1;
  });

  const handleExportToExcel = () => {
    const exportData = subscriptions.map(sub => ({
      "אימייל": sub.user_email,
      "שם מלא": sub.full_name || "",
      "טלפון": sub.phone || "",
      "חבילה": sub.subscription_tier,
      "סטטוס": getStatusLabel(sub.subscription_status),
      "סיום ניסיון": sub.trial_ends_at ? new Date(sub.trial_ends_at).toLocaleDateString("he-IL") : "",
      "תאריך פקיעה": sub.expires_at ? new Date(sub.expires_at).toLocaleDateString("he-IL") : "",
      "מגבלת לידים": sub.max_leads ?? "ברירת מחדל",
      "סכום חיוב": sub.billing_amount || 0,
      "מחזור חיוב": sub.billing_cycle || "",
      "תאריך הצטרפות": new Date(sub.created_at).toLocaleDateString("he-IL"),
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Subscriptions");
    XLSX.writeFile(wb, `subscriptions-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const getDaysRemaining = (expiresAt: string | null) => {
    if (!expiresAt) return null;
    const days = Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-muted-foreground">
          סה"כ {subscriptions.length} מנויים
        </div>
        <Button onClick={handleExportToExcel} variant="outline" size="sm">
          <Download className="h-4 w-4 ml-2" />
          ייצא לאקסל
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">פרטי קשר</TableHead>
              <TableHead className="text-right">שם מלא</TableHead>
              <TableHead className="text-right">
                <Button variant="ghost" onClick={() => handleSort("subscription_tier")}>
                  חבילה
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="text-right">
                <Button variant="ghost" onClick={() => handleSort("subscription_status")}>
                  סטטוס
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="text-right">מגבלת לידים</TableHead>
              <TableHead className="text-right">
                <Button variant="ghost" onClick={() => handleSort("trial_ends_at")}>
                  סיום ניסיון
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="text-right">תאריך פקיעה</TableHead>
              <TableHead className="text-right">ימים נותרים</TableHead>
              <TableHead className="text-right">סכום חיוב</TableHead>
              <TableHead className="text-right">תאריך הצטרפות</TableHead>
              <TableHead className="text-right">פעולות</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedSubscriptions.map((sub) => {
              const daysRemaining = getDaysRemaining(sub.expires_at);
              const trialDaysRemaining = getDaysRemaining(sub.trial_ends_at);
              const hasRenewed = sub.subscription_status === 'active' && sub.billing_amount && sub.billing_amount > 0;
              
              return (
                <TableRow key={sub.subscription_id}>
                  <TableCell className="text-right">
                    <div className="flex flex-col gap-1">
                      <a 
                        href={`mailto:${sub.user_email}`}
                        className="flex items-center gap-1 text-sm text-primary hover:underline justify-end"
                      >
                        <span className="max-w-[180px] truncate">{sub.user_email}</span>
                        <Mail className="h-3 w-3 flex-shrink-0" />
                      </a>
                      {sub.phone && (
                        <a 
                          href={`tel:${sub.phone}`}
                          className="flex items-center gap-1 text-sm text-primary hover:underline justify-end"
                        >
                          <span>{sub.phone}</span>
                          <Phone className="h-3 w-3 flex-shrink-0" />
                        </a>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{sub.full_name || "-"}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline">{sub.subscription_tier}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-col gap-1">
                      {getStatusBadge(sub.subscription_status)}
                      {hasRenewed && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          חידש
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {sub.max_leads !== null ? (
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                        {sub.max_leads} לידים
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">ברירת מחדל</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {sub.trial_ends_at ? (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-end gap-1 text-sm">
                          <span>{new Date(sub.trial_ends_at).toLocaleDateString("he-IL")}</span>
                          <Calendar className="h-3 w-3" />
                        </div>
                        {trialDaysRemaining !== null && (
                          <div className={`text-xs ${
                            trialDaysRemaining < 0 ? "text-red-600" : 
                            trialDaysRemaining < 3 ? "text-yellow-600" : 
                            "text-muted-foreground"
                          }`}>
                            {trialDaysRemaining < 0 ? 
                              `פג לפני ${Math.abs(trialDaysRemaining)} ימים` : 
                              `נותרו ${trialDaysRemaining} ימים`
                            }
                          </div>
                        )}
                      </div>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {sub.expires_at ? (
                      <div className="flex items-center justify-end gap-1 text-sm">
                        <span>{new Date(sub.expires_at).toLocaleDateString("he-IL")}</span>
                        <Calendar className="h-3 w-3" />
                      </div>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {daysRemaining !== null ? (
                      <div className={`flex items-center justify-end gap-1 text-sm ${
                        daysRemaining < 0 ? "text-red-600" : 
                        daysRemaining < 7 ? "text-yellow-600" : 
                        "text-green-600"
                      }`}>
                        <span>{daysRemaining} ימים</span>
                        <Clock className="h-3 w-3" />
                      </div>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {sub.billing_amount ? (
                      <div className="text-sm">
                        ₪{sub.billing_amount.toLocaleString()}
                        <span className="text-muted-foreground mr-1">/{sub.billing_cycle === "monthly" ? "חודש" : "שנה"}</span>
                      </div>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(sub.created_at), { addSuffix: true, locale: he })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedSubscription(sub);
                          setExtendDialogOpen(true);
                        }}
                      >
                        <Calendar className="h-4 w-4 ml-1" />
                        הארך
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedSubscription(sub);
                          setStatusDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4 ml-1" />
                        סטטוס
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedSubscription(sub);
                          setTierDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4 ml-1" />
                        חבילה
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {selectedSubscription && (
        <>
          <ExtendSubscriptionDialog
            open={extendDialogOpen}
            onOpenChange={setExtendDialogOpen}
            onExtend={(days, reason) =>
              onExtend(selectedSubscription.subscription_id, days, reason)
            }
            isLoading={isLoading}
          />
          
          <ChangeStatusDialog
            open={statusDialogOpen}
            onOpenChange={setStatusDialogOpen}
            currentStatus={selectedSubscription.subscription_status}
            onChangeStatus={(newStatus, reason) =>
              onChangeStatus(selectedSubscription.subscription_id, newStatus, reason)
            }
            isLoading={isLoading}
          />
          
          <ChangeTierDialog
            open={tierDialogOpen}
            onOpenChange={setTierDialogOpen}
            currentTier={selectedSubscription.subscription_tier}
            onChangeTier={(newTier, reason) =>
              onChangeTier(selectedSubscription.subscription_id, newTier, reason)
            }
            isLoading={isLoading}
          />
        </>
      )}
    </>
  );
}

function getStatusBadge(status: string) {
  const variants: Record<string, { label: string; className: string }> = {
    active: { label: "פעיל", className: "bg-green-100 text-green-800 hover:bg-green-100" },
    trial: { label: "ניסיון", className: "bg-blue-100 text-blue-800 hover:bg-blue-100" },
    past_due: { label: "תשלום נכשל", className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" },
    expired: { label: "פג תוקף", className: "bg-red-100 text-red-800 hover:bg-red-100" },
    cancelled: { label: "מבוטל", className: "bg-gray-100 text-gray-800 hover:bg-gray-100" },
  };

  const variant = variants[status] || { label: status, className: "" };
  return (
    <Badge className={variant.className}>
      {variant.label}
    </Badge>
  );
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    active: "פעיל",
    trial: "ניסיון",
    past_due: "תשלום נכשל",
    expired: "פג תוקף",
    cancelled: "מבוטל",
  };
  return labels[status] || status;
}

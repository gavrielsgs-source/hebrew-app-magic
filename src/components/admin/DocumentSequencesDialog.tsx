import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Plus, Save } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

interface DocumentSequence {
  id: string;
  document_type: string;
  current_number: number;
  prefix: string | null;
  user_id: string;
}

interface DocumentSequencesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
}

const DOC_TYPE_LABELS: Record<string, string> = {
  tax_invoice: "חשבונית מס",
  receipt: "קבלה",
  tax_invoice_receipt: "חשבונית מס קבלה",
  tax_invoice_credit: "חשבונית מס זיכוי",
  price_quote: "הצעת מחיר",
  sales_agreement: "הסכם מכר",
  new_car_order: "הזמנת רכב חדש",
  customer_document: "מסמך לקוח",
};

const ALL_DOC_TYPES = Object.keys(DOC_TYPE_LABELS);

export function DocumentSequencesDialog({
  open,
  onOpenChange,
  userId,
  userName,
}: DocumentSequencesDialogProps) {
  const queryClient = useQueryClient();
  const [sequences, setSequences] = useState<DocumentSequence[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editedNumbers, setEditedNumbers] = useState<Record<string, number>>({});
  const [showAddRow, setShowAddRow] = useState(false);
  const [newDocType, setNewDocType] = useState("");
  const [newNumber, setNewNumber] = useState(1);

  useEffect(() => {
    if (open && userId) {
      fetchSequences();
    }
  }, [open, userId]);

  const fetchSequences = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("document_sequences")
        .select("*")
        .eq("user_id", userId)
        .order("document_type");
      if (error) throw error;
      setSequences(data || []);
      setEditedNumbers({});
      setShowAddRow(false);
    } catch (err) {
      console.error("Error fetching sequences:", err);
      toast.error("שגיאה בטעינת המספורים");
    } finally {
      setLoading(false);
    }
  };

  const handleNumberChange = (id: string, value: number) => {
    setEditedNumbers((prev) => ({ ...prev, [id]: value }));
  };

  const hasChanges = Object.keys(editedNumbers).length > 0;

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = Object.entries(editedNumbers).map(([id, current_number]) =>
        supabase
          .from("document_sequences")
          .update({ current_number, updated_at: new Date().toISOString() })
          .eq("id", id)
      );
      const results = await Promise.all(updates);
      const failed = results.find((r) => r.error);
      if (failed?.error) throw failed.error;
      toast.success("המספורים עודכנו בהצלחה");
      setEditedNumbers({});
      await fetchSequences();
    } catch (err) {
      console.error("Error saving sequences:", err);
      toast.error("שגיאה בשמירת המספורים");
    } finally {
      setSaving(false);
    }
  };

  const handleAddSequence = async () => {
    if (!newDocType) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("document_sequences").insert({
        user_id: userId,
        document_type: newDocType,
        current_number: newNumber,
        prefix: "",
      });
      if (error) throw error;
      toast.success("רצף מספור חדש נוסף");
      setShowAddRow(false);
      setNewDocType("");
      setNewNumber(1);
      await fetchSequences();
    } catch (err) {
      console.error("Error adding sequence:", err);
      toast.error("שגיאה בהוספת רצף מספור");
    } finally {
      setSaving(false);
    }
  };

  const existingTypes = sequences.map((s) => s.document_type);
  const availableTypes = ALL_DOC_TYPES.filter((t) => !existingTypes.includes(t));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" dir="rtl">
        <DialogHeader>
          <DialogTitle>ניהול מספור מסמכים - {userName || "משתמש"}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : sequences.length === 0 && !showAddRow ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>לא נמצאו רצפי מספור למשתמש זה</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => setShowAddRow(true)}
            >
              <Plus className="h-4 w-4 ml-1" />
              הוסף רצף מספור
            </Button>
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">סוג מסמך</TableHead>
                    <TableHead className="text-right">קידומת</TableHead>
                    <TableHead className="text-right">מספר נוכחי</TableHead>
                    <TableHead className="text-right">מספר חדש</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sequences.map((seq) => (
                    <TableRow key={seq.id}>
                      <TableCell className="text-right font-medium">
                        {DOC_TYPE_LABELS[seq.document_type] || seq.document_type}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {seq.prefix || "-"}
                      </TableCell>
                      <TableCell className="text-right">{seq.current_number}</TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="number"
                          min={0}
                          className="w-24 text-right"
                          defaultValue={seq.current_number}
                          onChange={(e) =>
                            handleNumberChange(seq.id, parseInt(e.target.value) || 0)
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  {showAddRow && (
                    <TableRow>
                      <TableCell>
                        <Select value={newDocType} onValueChange={setNewDocType}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="בחר סוג מסמך" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {DOC_TYPE_LABELS[type]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-muted-foreground">-</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={0}
                          className="w-24 text-right"
                          value={newNumber}
                          onChange={(e) => setNewNumber(parseInt(e.target.value) || 0)}
                        />
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-between items-center mt-4">
              <div className="flex gap-2">
                {!showAddRow && availableTypes.length > 0 && (
                  <Button variant="outline" size="sm" onClick={() => setShowAddRow(true)}>
                    <Plus className="h-4 w-4 ml-1" />
                    הוסף רצף
                  </Button>
                )}
                {showAddRow && (
                  <>
                    <Button size="sm" onClick={handleAddSequence} disabled={!newDocType || saving}>
                      {saving ? <Loader2 className="h-4 w-4 animate-spin ml-1" /> : <Plus className="h-4 w-4 ml-1" />}
                      הוסף
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setShowAddRow(false)}>
                      ביטול
                    </Button>
                  </>
                )}
              </div>
              {hasChanges && (
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin ml-1" /> : <Save className="h-4 w-4 ml-1" />}
                  שמור שינויים
                </Button>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, MapPin, Plus } from "lucide-react";
import { useDocTypeMappings, useSaveDocTypeMapping } from "@/hooks/use-open-format";

const DEFAULT_MAPPINGS = [
  { internal_type: 'tax-invoice', tax_authority_code: '305', description: 'חשבונית מס' },
  { internal_type: 'receipt', tax_authority_code: '400', description: 'קבלה' },
  { internal_type: 'tax-invoice-receipt', tax_authority_code: '320', description: 'חשבונית מס / קבלה' },
  { internal_type: 'credit-invoice', tax_authority_code: '330', description: 'חשבונית זיכוי' },
  { internal_type: 'delivery-note', tax_authority_code: '200', description: 'תעודת משלוח' },
  { internal_type: 'purchase-order', tax_authority_code: '100', description: 'הזמנת רכש' },
  { internal_type: 'price-quote', tax_authority_code: '000', description: 'הצעת מחיר (לא מיוצא)' },
  { internal_type: 'proforma-invoice', tax_authority_code: '000', description: 'חשבון עסקה (לא מיוצא)' },
];

export function DocTypeMappings() {
  const { data: mappings, isLoading } = useDocTypeMappings();
  const saveMapping = useSaveDocTypeMapping();
  const [editRow, setEditRow] = useState<string | null>(null);
  const [editCode, setEditCode] = useState("");
  const [editEnabled, setEditEnabled] = useState(true);

  // Merge DB mappings with defaults
  const mergedMappings = DEFAULT_MAPPINGS.map(def => {
    const dbMapping = mappings?.find(m => m.internal_type === def.internal_type);
    return {
      ...def,
      tax_authority_code: dbMapping?.tax_authority_code ?? def.tax_authority_code,
      enabled: dbMapping?.enabled ?? true,
      fromDb: !!dbMapping,
      notes: dbMapping?.notes || '',
    };
  });

  const handleEdit = (internalType: string, code: string, enabled: boolean) => {
    setEditRow(internalType);
    setEditCode(code);
    setEditEnabled(enabled);
  };

  const handleSave = () => {
    if (!editRow) return;
    const def = DEFAULT_MAPPINGS.find(d => d.internal_type === editRow);
    saveMapping.mutate({
      internal_type: editRow,
      tax_authority_code: editCode,
      description: def?.description,
      enabled: editEnabled,
    }, {
      onSuccess: () => setEditRow(null),
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          מיפוי סוגי מסמכים
        </CardTitle>
        <CardDescription>
          מיפוי בין סוגי מסמכים במערכת לקודי סוג מסמך של רשות המיסים
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>סוג מסמך פנימי</TableHead>
              <TableHead>תיאור</TableHead>
              <TableHead>קוד רשות המיסים</TableHead>
              <TableHead>מופעל</TableHead>
              <TableHead>מקור</TableHead>
              <TableHead>פעולות</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mergedMappings.map((m) => (
              <TableRow key={m.internal_type}>
                <TableCell className="font-mono text-xs">{m.internal_type}</TableCell>
                <TableCell>{m.description}</TableCell>
                <TableCell>
                  {editRow === m.internal_type ? (
                    <Input
                      value={editCode}
                      onChange={(e) => setEditCode(e.target.value)}
                      className="w-20 h-8"
                      maxLength={3}
                    />
                  ) : (
                    <Badge variant={m.tax_authority_code === '000' ? 'secondary' : 'default'}>
                      {m.tax_authority_code}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {editRow === m.internal_type ? (
                    <Switch checked={editEnabled} onCheckedChange={setEditEnabled} />
                  ) : (
                    <Badge variant={m.enabled ? 'default' : 'secondary'}>
                      {m.enabled ? 'כן' : 'לא'}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {m.fromDb ? 'מותאם' : 'ברירת מחדל'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {editRow === m.internal_type ? (
                    <div className="flex gap-1">
                      <Button size="sm" onClick={handleSave} disabled={saveMapping.isPending}>
                        {saveMapping.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditRow(null)}>ביטול</Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(m.internal_type, m.tax_authority_code, m.enabled)}
                    >
                      עריכה
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <p className="text-xs text-muted-foreground mt-3">
          קודי מסמך 000 לא ייוצאו לקובץ. ניתן להשבית סוגי מסמכים כדי לדלג עליהם בייצוא.
        </p>
      </CardContent>
    </Card>
  );
}

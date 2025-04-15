
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, MessageSquare, User, Plus } from "lucide-react";
import { useLeads } from "@/hooks/use-leads";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AddLeadForm } from "./leads/AddLeadForm";

export function LeadsTable() {
  const { leads, isLoading } = useLeads();

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" /> הוסף ליד חדש
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[400px]">
            <SheetHeader>
              <SheetTitle>הוסף ליד חדש</SheetTitle>
            </SheetHeader>
            <AddLeadForm />
          </SheetContent>
        </Sheet>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>שם</TableHead>
              <TableHead>טלפון</TableHead>
              <TableHead>אימייל</TableHead>
              <TableHead>מקור</TableHead>
              <TableHead>תאריך</TableHead>
              <TableHead>סטטוס</TableHead>
              <TableHead>פעולות</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  טוען...
                </TableCell>
              </TableRow>
            ) : leads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  אין לידים להצגה
                </TableCell>
              </TableRow>
            ) : (
              leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">{lead.name}</TableCell>
                  <TableCell>{lead.phone}</TableCell>
                  <TableCell>{lead.email}</TableCell>
                  <TableCell>{lead.source || "ידני"}</TableCell>
                  <TableCell>{new Date(lead.created_at).toLocaleDateString('he-IL')}</TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeColor(lead.status)}>
                      {getStatusText(lead.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2 rtl:space-x-reverse">
                      <Button variant="ghost" size="icon">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function getStatusBadgeColor(status: string | null) {
  switch (status) {
    case "new":
      return "bg-blue-500 hover:bg-blue-600";
    case "in_progress":
      return "bg-yellow-500 hover:bg-yellow-600";
    case "waiting":
      return "bg-purple-500 hover:bg-purple-600";
    case "closed":
      return "bg-green-500 hover:bg-green-600";
    default:
      return "bg-gray-500 hover:bg-gray-600";
  }
}

function getStatusText(status: string | null) {
  switch (status) {
    case "new":
      return "חדש";
    case "in_progress":
      return "בטיפול";
    case "waiting":
      return "בהמתנה";
    case "closed":
      return "סגור";
    default:
      return "לא ידוע";
  }
}

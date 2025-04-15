
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
import { Phone, MessageSquare, User } from "lucide-react";

// נתוני דוגמה עבור לידים
const leads = [
  {
    id: "1",
    name: "דני כהן",
    phone: "050-1234567",
    email: "dani@example.com",
    source: "פייסבוק",
    date: "15/04/2025",
    status: "חדש",
  },
  {
    id: "2",
    name: "שרה לוי",
    phone: "052-7654321",
    email: "sara@example.com",
    source: "אינסטגרם",
    date: "14/04/2025",
    status: "בטיפול",
  },
  {
    id: "3",
    name: "יוסי אברהם",
    phone: "054-9876543",
    email: "yossi@example.com",
    source: "ידני",
    date: "13/04/2025",
    status: "בהמתנה",
  },
  {
    id: "4",
    name: "מיכל גולן",
    phone: "058-1122334",
    email: "michal@example.com",
    source: "פייסבוק",
    date: "12/04/2025",
    status: "סגור",
  },
  {
    id: "5",
    name: "אבי דוד",
    phone: "053-5566778",
    email: "avi@example.com",
    source: "אינסטגרם",
    date: "11/04/2025",
    status: "חדש",
  },
];

// פונקציה להחזרת צבע הבאדג' לפי סטטוס
const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case "חדש":
      return "bg-blue-500 hover:bg-blue-600";
    case "בטיפול":
      return "bg-yellow-500 hover:bg-yellow-600";
    case "בהמתנה":
      return "bg-purple-500 hover:bg-purple-600";
    case "סגור":
      return "bg-green-500 hover:bg-green-600";
    default:
      return "bg-gray-500 hover:bg-gray-600";
  }
};

export function LeadsTable() {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Button variant="outline" className="ms-auto">
          <User className="mr-2 h-4 w-4" /> הוסף ליד חדש
        </Button>
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
            {leads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell className="font-medium">{lead.name}</TableCell>
                <TableCell>{lead.phone}</TableCell>
                <TableCell>{lead.email}</TableCell>
                <TableCell>{lead.source}</TableCell>
                <TableCell>{lead.date}</TableCell>
                <TableCell>
                  <Badge className={getStatusBadgeColor(lead.status)}>
                    {lead.status}
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
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

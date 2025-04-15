
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
import { Car, Share2, Edit } from "lucide-react";

// נתוני דוגמה עבור רכבים
const cars = [
  {
    id: "1",
    model: "מאזדה 3",
    year: "2022",
    km: "15,000",
    price: "110,000 ₪",
    color: "לבן",
    status: "במלאי",
  },
  {
    id: "2",
    model: "יונדאי i10",
    year: "2020",
    km: "45,000",
    price: "65,000 ₪",
    color: "כחול",
    status: "במלאי",
  },
  {
    id: "3",
    model: "סקודה אוקטביה",
    year: "2021",
    km: "30,000",
    price: "85,000 ₪",
    color: "אפור",
    status: "בהזמנה",
  },
  {
    id: "4",
    model: "קיה פיקנטו",
    year: "2019",
    km: "60,000",
    price: "50,000 ₪",
    color: "אדום",
    status: "נמכר",
  },
  {
    id: "5",
    model: "טויוטה קורולה",
    year: "2023",
    km: "5,000",
    price: "130,000 ₪",
    color: "שחור",
    status: "במלאי",
  },
];

// פונקציה להחזרת צבע הבאדג' לפי סטטוס
const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case "במלאי":
      return "bg-green-500 hover:bg-green-600";
    case "בהזמנה":
      return "bg-blue-500 hover:bg-blue-600";
    case "נמכר":
      return "bg-gray-500 hover:bg-gray-600";
    default:
      return "bg-gray-500 hover:bg-gray-600";
  }
};

export function CarsTable() {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Button variant="outline" className="ms-auto">
          <Car className="mr-2 h-4 w-4" /> הוסף רכב חדש
        </Button>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>דגם</TableHead>
              <TableHead>שנה</TableHead>
              <TableHead>ק"מ</TableHead>
              <TableHead>מחיר</TableHead>
              <TableHead>צבע</TableHead>
              <TableHead>סטטוס</TableHead>
              <TableHead>פעולות</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cars.map((car) => (
              <TableRow key={car.id}>
                <TableCell className="font-medium">{car.model}</TableCell>
                <TableCell>{car.year}</TableCell>
                <TableCell>{car.km}</TableCell>
                <TableCell>{car.price}</TableCell>
                <TableCell>{car.color}</TableCell>
                <TableCell>
                  <Badge className={getStatusBadgeColor(car.status)}>
                    {car.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2 rtl:space-x-reverse">
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Share2 className="h-4 w-4" />
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

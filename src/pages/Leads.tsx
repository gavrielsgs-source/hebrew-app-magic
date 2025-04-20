
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useLeads } from "@/hooks/use-leads";
import { LeadsTable } from "@/components/LeadsTable";
import { LeadsGrid } from "@/components/leads/LeadsGrid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Tag } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AddLeadForm } from "@/components/leads/AddLeadForm";
import { Badge } from "@/components/ui/badge";

export default function Leads() {
  const { leads, isLoading } = useLeads();
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredLeads = leads.filter(lead => 
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (lead.phone && lead.phone.includes(searchTerm)) ||
    (lead.email && lead.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  return (
    <div className="container py-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">לקוחות</h1>
          <p className="text-muted-foreground">ניהול לקוחות ולידים פוטנציאליים</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative w-full md:w-64">
            <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="חיפוש לקוח..."
              className="pr-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button className="shrink-0">
                <Plus className="mr-2 h-4 w-4" /> הוסף לקוח
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px]">
              <SheetHeader>
                <SheetTitle>הוסף לקוח חדש</SheetTitle>
              </SheetHeader>
              <AddLeadForm />
            </SheetContent>
          </Sheet>
        </div>
      </div>
      
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>סיכום לקוחות</CardTitle>
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-primary/10">
                <Tag className="h-3 w-3 mr-1" />
                מחפשי רכב משפחתי: 12
              </Badge>
              <Badge variant="outline" className="bg-orange-500/10">
                <Tag className="h-3 w-3 mr-1" />
                תקציב גבוה: 8
              </Badge>
              <Badge variant="outline" className="bg-green-500/10">
                <Tag className="h-3 w-3 mr-1" />
                קרובים לרכישה: 5
              </Badge>
            </div>
          </div>
          <CardDescription>
            סה"כ {filteredLeads.length} לקוחות פעילים במערכת
          </CardDescription>
        </CardHeader>
      </Card>
      
      <Tabs defaultValue="grid" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="grid">כרטיסיות</TabsTrigger>
          <TabsTrigger value="table">טבלה</TabsTrigger>
        </TabsList>
        
        <TabsContent value="grid">
          <LeadsGrid leads={filteredLeads} isLoading={isLoading} />
        </TabsContent>
        
        <TabsContent value="table">
          <LeadsTable searchTerm={searchTerm} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

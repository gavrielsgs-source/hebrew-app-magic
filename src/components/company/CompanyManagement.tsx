import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Building2, Users, Settings } from "lucide-react";
import { useCompanies } from "@/hooks/use-companies";
import { toast } from "sonner";

export function CompanyManagement() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [companyName, setCompanyName] = useState("");
  
  const { companies, isLoading, createCompany } = useCompanies();

  const handleCreateCompany = async () => {
    if (!companyName.trim()) {
      toast.error("נא להזין שם חברה");
      return;
    }

    try {
      await createCompany.mutateAsync(companyName.trim());
      setCompanyName("");
      setIsCreateOpen(false);
    } catch (error) {
      console.error("Error creating company:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-gray-200 animate-pulse rounded-lg" />
        <div className="h-32 bg-gray-200 animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">ניהול חברות</h2>
          <p className="text-gray-600">נהל את החברות שלך והמשתמשים בהן</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              חברה חדשה
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]" dir="rtl">
            <DialogHeader>
              <DialogTitle>יצירת חברה חדשה</DialogTitle>
              <DialogDescription>
                צור חברה חדשה כדי לנהל משתמשים ומנוי נפרד
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="company-name">שם החברה</Label>
                <Input
                  id="company-name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="הזן שם חברה..."
                  className="text-right"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
              >
                ביטול
              </Button>
              <Button
                onClick={handleCreateCompany}
                disabled={createCompany.isPending || !companyName.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {createCompany.isPending ? "יוצר..." : "צור חברה"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {companies.map((company) => (
          <CompanyCard key={company.id} company={company} />
        ))}
        
        {companies.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                אין חברות עדיין
              </h3>
              <p className="text-gray-600 text-center mb-6">
                צור את החברה הראשונה שלך כדי להתחיל לנהל משתמשים ומנוי
              </p>
              <Button
                onClick={() => setIsCreateOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                צור חברה חדשה
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function CompanyCard({ company }: { company: any }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-right">
          <Building2 className="h-5 w-5 text-blue-600" />
          {company.name}
        </CardTitle>
        <CardDescription className="text-right">
          נוצרה ב-{new Date(company.created_at).toLocaleDateString('he-IL')}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="flex justify-between items-center text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>משתמשים פעילים</span>
          </div>
          <span className="font-semibold">0</span>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={() => {
            // Navigate to company settings
            window.location.href = `/company/${company.id}/settings`;
          }}
        >
          <Settings className="h-4 w-4 mr-2" />
          הגדרות חברה
        </Button>
      </CardFooter>
    </Card>
  );
}
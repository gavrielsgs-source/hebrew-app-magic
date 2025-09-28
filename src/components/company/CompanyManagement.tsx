import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Building2, Users, Settings, Sparkles } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              ניהול חברות
            </h1>
            <p className="text-slate-600 text-lg">נהל את החברות שלך והמשתמשים בהן בקלות ובאמינות</p>
          </div>
          
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
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

        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {companies.map((company) => (
            <CompanyCard key={company.id} company={company} />
          ))}
          
          {companies.length === 0 && (
            <div className="col-span-full">
              <Card className="border-dashed border-2 border-slate-300 bg-white/50 backdrop-blur-sm hover:bg-white/70 transition-all duration-300">
                <CardContent className="flex flex-col items-center justify-center py-16 px-8">
                  <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-6 rounded-2xl mb-6">
                    <Building2 className="h-12 w-12 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3 text-center">
                    בואו נתחיל!
                  </h3>
                  <p className="text-slate-600 text-center mb-8 max-w-md leading-relaxed">
                    צור את החברה הראשונה שלך כדי להתחיל לנהל משתמשים, מנוי ולהפיק מסמכים בקלות
                  </p>
                  <Button
                    onClick={() => setIsCreateOpen(true)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 px-8 py-3 text-lg"
                  >
                    <Sparkles className="h-5 w-5 mr-2" />
                    צור חברה חדשה
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CompanyCard({ company }: { company: any }) {
  return (
    <Card className="group bg-white/80 backdrop-blur-sm border-0 shadow-md hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:bg-white overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <CardHeader className="relative pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 text-right">
            <CardTitle className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-700 transition-colors duration-300">
              {company.name}
            </CardTitle>
            <CardDescription className="text-slate-600 text-sm">
              נוצרה ב-{new Date(company.created_at).toLocaleDateString('he-IL')}
            </CardDescription>
          </div>
          <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-3 rounded-xl group-hover:from-blue-200 group-hover:to-indigo-200 transition-all duration-300">
            <Building2 className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="relative space-y-4">
        <div className="bg-slate-50 rounded-xl p-4 group-hover:bg-blue-50 transition-colors duration-300">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-slate-600">
              <Users className="h-4 w-4" />
              <span className="text-sm font-medium">משתמשים פעילים</span>
            </div>
            <div className="bg-gradient-to-r from-green-100 to-emerald-100 px-3 py-1 rounded-full">
              <span className="font-bold text-green-700">0</span>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-50 rounded-xl p-4 group-hover:bg-indigo-50 transition-colors duration-300">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-slate-600">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">סטטוס מנוי</span>
            </div>
            <div className="bg-gradient-to-r from-blue-100 to-indigo-100 px-3 py-1 rounded-full">
              <span className="font-bold text-blue-700 text-sm">פעיל</span>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="relative pt-0">
        <Button 
          className="w-full bg-gradient-to-r from-slate-100 to-slate-200 hover:from-blue-600 hover:to-indigo-600 text-slate-700 hover:text-white border-0 shadow-sm hover:shadow-lg transition-all duration-300 group-hover:scale-105"
          onClick={() => {
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
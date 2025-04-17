
import { useEffect } from "react";
import { useProfile } from "@/hooks/use-profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, RefreshCw, Save, User } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

const profileFormSchema = z.object({
  full_name: z.string().min(2, "נדרשות לפחות 2 אותיות").nullable(),
  phone: z.string().min(9, "מספר טלפון לא תקין").max(15, "מספר טלפון לא תקין").nullable(),
  company_name: z.string().nullable(),
  position: z.string().nullable(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function Profile() {
  const { profile, isLoading, isError, error, updateProfile } = useProfile();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      full_name: "",
      phone: "",
      company_name: "",
      position: "",
    },
  });

  // Update form when profile data loads
  useEffect(() => {
    if (profile) {
      console.log("Profile data loaded:", profile);
      form.reset({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        company_name: profile.company_name || "",
        position: profile.position || "",
      });
    }
  }, [profile, form]);

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      await updateProfile.mutateAsync(values);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleRetry = () => {
    window.location.reload();
  };

  // חישוב אחוז השלמת הפרופיל
  const calculateProfileCompletion = () => {
    if (!profile) return 0;
    
    let fieldsCount = 4; // מספר השדות שאנחנו בודקים
    let completedFields = 0;
    
    if (profile.full_name) completedFields++;
    if (profile.phone) completedFields++;
    if (profile.company_name) completedFields++;
    if (profile.position) completedFields++;
    
    return (completedFields / fieldsCount) * 100;
  };

  const completionPercentage = profile ? calculateProfileCompletion() : 0;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <div className="animate-pulse w-16 h-16 rounded-full bg-gradient-to-r from-blue-400 to-purple-500"></div>
        <div className="text-lg font-medium text-slate-700 dark:text-slate-300">טוען את פרטי הפרופיל שלך...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive" className="border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/50">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="text-lg font-semibold">שגיאה בטעינת פרופיל</AlertTitle>
          <AlertDescription className="mt-2">
            {error instanceof Error ? error.message : "אירעה שגיאה. אנא נסה שוב."}
          </AlertDescription>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-4 bg-white dark:bg-slate-800 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50" 
            onClick={handleRetry}
          >
            <RefreshCw className="h-4 w-4 ml-2" />
            נסה שוב
          </Button>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 mb-4">
            <User className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-2">פרופיל אישי</h1>
          <p className="text-slate-600 dark:text-slate-400">עדכן את פרטי הפרופיל שלך</p>
        </div>
        
        <Card className="border border-slate-200/50 dark:border-slate-800/50 shadow-md dark:shadow-slate-900/10 overflow-hidden">
          <CardHeader className="pb-4 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
            <CardTitle className="flex items-center">
              <span>פרטי פרופיל</span>
              {updateProfile.isPending && <div className="mr-3 animate-spin h-4 w-4 border-2 border-slate-400 border-t-transparent rounded-full"></div>}
              {updateProfile.isSuccess && <CheckCircle2 className="mr-3 h-5 w-5 text-green-500 animate-fade-in" />}
            </CardTitle>
            <CardDescription>
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1">
                  <span>השלמת פרופיל</span>
                  <span>{Math.round(completionPercentage)}%</span>
                </div>
                <Progress value={completionPercentage} className="h-2" />
              </div>
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 dark:text-slate-300">שם מלא</FormLabel>
                      <FormControl>
                        <Input placeholder="ישראל ישראלי" {...field} value={field.value || ""} 
                          className="border-slate-300 dark:border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/30" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 dark:text-slate-300">טלפון</FormLabel>
                      <FormControl>
                        <Input placeholder="050-0000000" {...field} value={field.value || ""} 
                          className="border-slate-300 dark:border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/30" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator className="my-6 bg-slate-200 dark:bg-slate-700" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="company_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 dark:text-slate-300">שם החברה</FormLabel>
                        <FormControl>
                          <Input placeholder="שם החברה" {...field} value={field.value || ""} 
                            className="border-slate-300 dark:border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/30" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 dark:text-slate-300">תפקיד</FormLabel>
                        <FormControl>
                          <Input placeholder="תפקיד" {...field} value={field.value || ""} 
                            className="border-slate-300 dark:border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/30" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button type="submit" className="w-full mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all" disabled={updateProfile.isPending}>
                  {updateProfile.isPending ? (
                    <span className="flex items-center">
                      <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full ml-2"></span>
                      מעדכן...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Save className="w-4 h-4 ml-2" />
                      עדכן פרופיל
                    </span>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

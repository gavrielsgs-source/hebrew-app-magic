
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
      form.reset({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        company_name: profile.company_name || "",
        position: profile.position || "",
      });
    }
  }, [profile, form]);

  const onSubmit = async (values: ProfileFormValues) => {
    await updateProfile.mutateAsync(values);
  };

  const handleRetry = () => {
    window.location.reload();
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">טוען...</div>;
  }

  if (isError) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>שגיאה בטעינת פרופיל</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : "אירעה שגיאה. אנא נסה שוב."}
          </AlertDescription>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2" 
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
      <Card>
        <CardHeader>
          <CardTitle>פרטי פרופיל</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>שם מלא</FormLabel>
                    <FormControl>
                      <Input placeholder="ישראל ישראלי" {...field} value={field.value || ""} />
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
                    <FormLabel>טלפון</FormLabel>
                    <FormControl>
                      <Input placeholder="050-0000000" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>שם החברה</FormLabel>
                    <FormControl>
                      <Input placeholder="שם החברה" {...field} value={field.value || ""} />
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
                    <FormLabel>תפקיד</FormLabel>
                    <FormControl>
                      <Input placeholder="תפקיד" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={updateProfile.isPending}>
                {updateProfile.isPending ? "מעדכן..." : "עדכן פרופיל"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

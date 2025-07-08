import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ImageUploadInput } from "./ImageUploadInput";
import { carFormSchema, CarFormValues } from "./car-form-schema";
import { useAuthContext } from "@/contexts/auth-context";

interface CarFormBaseProps {
  defaultValues: CarFormValues;
  onSubmit: (values: CarFormValues, images: File[]) => Promise<void>;
  isSubmitting?: boolean;
  submitLabel: string;
  onCancel?: () => void;
  className?: string;
}

export function CarFormBase({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  submitLabel,
  onCancel,
  className,
}: CarFormBaseProps) {
  const [images, setImages] = useState<File[]>([]);
  const { agencies, isAdmin, hasRole } = useAuthContext();
  const canSelectAgency = isAdmin || hasRole('agency_manager');

  console.log("CarFormBase - Rendering with props:", {
    submitLabel,
    isSubmitting,
    hasOnCancel: !!onCancel,
    defaultValues,
    canSelectAgency
  });

  const form = useForm<CarFormValues>({
    resolver: zodResolver(carFormSchema),
    defaultValues,
  });

  console.log("CarFormBase - Form state:", {
    isValid: form.formState.isValid,
    isDirty: form.formState.isDirty,
    isSubmitting: form.formState.isSubmitting,
    errors: form.formState.errors
  });

  const handleImageChange = (files: FileList | null | File[]) => {
    console.log("CarFormBase - Image change:", files);
    if (Array.isArray(files)) {
      setImages(files);
    } else if (files) {
      setImages(Array.from(files));
    } else {
      setImages([]);
    }
  };

  const internalOnSubmit = async (values: CarFormValues) => {
    console.log("CarFormBase - Internal submit called with values:", values);
    console.log("CarFormBase - Current state:", { isSubmitting, images: images.length });
    
    // Prevent multiple submissions
    if (isSubmitting) {
      console.log("CarFormBase - Already submitting, preventing double submission");
      return;
    }
    
    try {
      console.log("CarFormBase - About to call parent onSubmit");
      await onSubmit(values, images);
      console.log("CarFormBase - Parent onSubmit completed successfully");
    } catch (error) {
      console.error("CarFormBase - Error in form submission:", error);
      // Don't re-throw, let the parent handle the error
    }
  };

  const handleFormSubmit = form.handleSubmit(internalOnSubmit);

  return (
    <Form {...form}>
      <form 
        onSubmit={(e) => {
          console.log("CarFormBase - Form onSubmit event triggered");
          e.preventDefault();
          e.stopPropagation();
          handleFormSubmit();
        }} 
        className={`space-y-4 mt-4 ${className || ''}`}
      >
        {canSelectAgency && agencies && agencies.length > 0 && (
          <FormField
            control={form.control}
            name="agency_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>סוכנות</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value || ""}
                  value={field.value || ""}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="בחר סוכנות" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {agencies.map((agency) => (
                      <SelectItem key={agency.id} value={agency.id}>
                        {agency.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="space-y-4">
          <FormItem>
            <FormLabel>תמונות הרכב</FormLabel>
            <FormControl>
              <ImageUploadInput onChange={handleImageChange} value={images} />
            </FormControl>
            <FormDescription>
              ניתן להעלות מספר תמונות של הרכב
            </FormDescription>
          </FormItem>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="make"
            render={({ field }) => (
              <FormItem>
                <FormLabel>יצרן</FormLabel>
                <FormControl>
                  <Input placeholder="טויוטה" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>דגם</FormLabel>
                <FormControl>
                  <Input placeholder="קורולה" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>שנה</FormLabel>
                <FormControl>
                  <Input placeholder="2024" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="kilometers"
            render={({ field }) => (
              <FormItem>
                <FormLabel>קילומטראז'</FormLabel>
                <FormControl>
                  <Input placeholder="15000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>מחיר</FormLabel>
                <FormControl>
                  <Input placeholder="150000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="transmission"
            render={({ field }) => (
              <FormItem>
                <FormLabel>תיבת הילוכים</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="בחר תיבת הילוכים" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="manual">ידני</SelectItem>
                    <SelectItem value="automatic">אוטומט</SelectItem>
                    <SelectItem value="robotics">רובוטי</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="fuel_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>סוג דלק</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="בחר סוג דלק" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="gasoline">בנזין</SelectItem>
                    <SelectItem value="diesel">דיזל</SelectItem>
                    <SelectItem value="hybrid">היברידי</SelectItem>
                    <SelectItem value="electric">חשמלי</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="engine_size"
            render={({ field }) => (
              <FormItem>
                <FormLabel>נפח מנוע</FormLabel>
                <FormControl>
                  <Input placeholder="1600" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="exterior_color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>צבע חיצוני</FormLabel>
                <FormControl>
                  <Input placeholder="לבן" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="ownership_history"
            render={({ field }) => (
              <FormItem>
                <FormLabel>יד</FormLabel>
                <FormControl>
                  <Input placeholder="יד ראשונה" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* New fields */}
          <FormField
            control={form.control}
            name="entry_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>תאריך כניסה</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="license_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>מספר רישוי</FormLabel>
                <FormControl>
                  <Input placeholder="123-45-678" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="chassis_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>מספר שלדה</FormLabel>
                <FormControl>
                  <Input placeholder="VIN123456789" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="next_test_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>תאריך טסט הבא</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormDescription>
                  יתווסף כמשימה ביומן
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>תיאור כללי והערות</FormLabel>
              <FormControl>
                <Textarea placeholder="תיאור נוסף של הרכב..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          {onCancel && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={(e) => {
                console.log("CarFormBase - Cancel button clicked");
                e.preventDefault();
                onCancel();
              }}
            >
              ביטול
            </Button>
          )}
          <Button 
            type="submit"
            disabled={isSubmitting || form.formState.isSubmitting}
            className="min-w-[120px]"
          >
            {(isSubmitting || form.formState.isSubmitting) ? "שומר..." : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}

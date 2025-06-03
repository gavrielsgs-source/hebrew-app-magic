
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
}

export function CarFormBase({
  defaultValues,
  onSubmit,
  isSubmitting,
  submitLabel,
  onCancel,
}: CarFormBaseProps) {
  const [images, setImages] = useState<File[]>([]);
  const { agencies, isAdmin, hasRole } = useAuthContext();
  const canSelectAgency = isAdmin || hasRole('agency_manager');

  const form = useForm<CarFormValues>({
    resolver: zodResolver(carFormSchema),
    defaultValues,
  });

  const handleImageChange = (files: FileList | null | File[]) => {
    if (Array.isArray(files)) {
      setImages(files);
    } else if (files) {
      setImages(Array.from(files));
    } else {
      setImages([]);
    }
  };

  const internalOnSubmit = async (values: CarFormValues) => {
    console.log("CarFormBase - Form submitted with values:", values);
    console.log("CarFormBase - Images:", images);
    try {
      await onSubmit(values, images);
    } catch (error) {
      console.error("CarFormBase - Error in form submission:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(internalOnSubmit)} className="space-y-4 mt-4">
        {canSelectAgency && agencies && agencies.length > 0 && (
          <FormField
            control={form.control}
            name="agency_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>סוכנות</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
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

        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              ביטול
            </Button>
          )}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "שומר..." : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}

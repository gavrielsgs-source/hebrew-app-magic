
import { FormDescription, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { ImageUploadInput } from "../ImageUploadInput";

interface StepImagesProps {
  images: File[];
  onImagesChange: (files: FileList | null | File[]) => void;
}

export function StepImages({ images, onImagesChange }: StepImagesProps) {
  return (
    <div className="space-y-4">
      <FormItem>
        <FormLabel className="text-base font-medium">תמונות הרכב</FormLabel>
        <FormDescription>
          העלה תמונות של הרכב (PNG / JPG בלבד). גרור לשינוי סדר.
        </FormDescription>
        <FormControl>
          <ImageUploadInput onChange={onImagesChange} value={images} />
        </FormControl>
      </FormItem>
    </div>
  );
}


import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface ImageUploadInputProps {
  onChange: (files: FileList | null) => void;
  value?: File[];
}

export function ImageUploadInput({ onChange, value }: ImageUploadInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-4">
        {value?.map((file, index) => (
          <div key={index} className="relative aspect-video rounded-lg border overflow-hidden">
            <img
              src={URL.createObjectURL(file)}
              alt={`תמונה ${index + 1}`}
              className="object-cover w-full h-full"
            />
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="h-4 w-4 ml-2" />
        העלאת תמונות
      </Button>
      <input
        type="file"
        ref={inputRef}
        className="hidden"
        multiple
        accept="image/*"
        onChange={(e) => onChange(e.target.files)}
      />
    </div>
  );
}

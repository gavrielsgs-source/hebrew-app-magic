
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";

interface ImageUploadInputProps {
  onChange: (files: FileList | null) => void;
  value?: File[];
}

export function ImageUploadInput({ onChange, value }: ImageUploadInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  // Create preview URLs when value changes
  useState(() => {
    if (value && value.length > 0) {
      const urls = value.map(file => URL.createObjectURL(file));
      setPreviewUrls(urls);
      
      // Clean up URLs on unmount
      return () => {
        urls.forEach(url => URL.revokeObjectURL(url));
      };
    }
  });
  
  const handleRemoveImage = (index: number) => {
    if (value) {
      const newFiles = [...value];
      newFiles.splice(index, 1);
      
      // Convert back to FileList-like object for the onChange handler
      const dataTransfer = new DataTransfer();
      newFiles.forEach(file => dataTransfer.items.add(file));
      
      onChange(dataTransfer.files);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {value?.map((file, index) => (
          <div key={index} className="relative aspect-video rounded-lg border overflow-hidden group">
            <img
              src={URL.createObjectURL(file)}
              alt={`תמונה ${index + 1}`}
              className="object-cover w-full h-full"
            />
            <button
              type="button"
              onClick={() => handleRemoveImage(index)}
              className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
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
        העלאת תמונות {value?.length ? `(${value.length})` : ''}
      </Button>
      
      <input
        type="file"
        ref={inputRef}
        className="hidden"
        multiple
        accept="image/*"
        onChange={(e) => onChange(e.target.files)}
      />
      
      {value?.length ? (
        <p className="text-xs text-muted-foreground mt-1 text-center">
          נבחרו {value.length} תמונות
        </p>
      ) : null}
    </div>
  );
}

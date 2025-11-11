
import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Star, GripVertical } from "lucide-react";

interface ImageUploadInputProps {
  onChange: (files: FileList | null) => void;
  value?: File[];
}

export function ImageUploadInput({ onChange, value }: ImageUploadInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [primaryImageIndex, setPrimaryImageIndex] = useState<number>(0);

  // Create preview URLs when value changes
  useEffect(() => {
    if (value && value.length > 0) {
      const urls = value.map(file => URL.createObjectURL(file));
      setPreviewUrls(urls);
      
      // Clean up URLs on unmount
      return () => {
        urls.forEach(url => URL.revokeObjectURL(url));
      };
    } else {
      setPreviewUrls([]);
    }
  }, [value]);
  
  const handleRemoveImage = (index: number) => {
    if (value) {
      const newFiles = [...value];
      newFiles.splice(index, 1);
      
      // Adjust primary image index if needed
      if (index === primaryImageIndex && newFiles.length > 0) {
        setPrimaryImageIndex(0);
      } else if (index < primaryImageIndex) {
        setPrimaryImageIndex(primaryImageIndex - 1);
      }
      
      // Convert back to FileList-like object for the onChange handler
      const dataTransfer = new DataTransfer();
      newFiles.forEach(file => dataTransfer.items.add(file));
      
      onChange(dataTransfer.files);
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || !value) return;
    
    const newFiles = [...value];
    const [draggedFile] = newFiles.splice(draggedIndex, 1);
    newFiles.splice(dropIndex, 0, draggedFile);
    
    // Adjust primary image index
    if (draggedIndex === primaryImageIndex) {
      setPrimaryImageIndex(dropIndex);
    } else if (draggedIndex < primaryImageIndex && dropIndex >= primaryImageIndex) {
      setPrimaryImageIndex(primaryImageIndex - 1);
    } else if (draggedIndex > primaryImageIndex && dropIndex <= primaryImageIndex) {
      setPrimaryImageIndex(primaryImageIndex + 1);
    }
    
    const dataTransfer = new DataTransfer();
    newFiles.forEach(file => dataTransfer.items.add(file));
    
    onChange(dataTransfer.files);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const setPrimaryImage = (index: number) => {
    setPrimaryImageIndex(index);
    
    if (!value) return;
    
    // Reorder files to put primary image first
    const newFiles = [...value];
    const [primaryFile] = newFiles.splice(index, 1);
    newFiles.unshift(primaryFile);
    
    const dataTransfer = new DataTransfer();
    newFiles.forEach(file => dataTransfer.items.add(file));
    
    onChange(dataTransfer.files);
    setPrimaryImageIndex(0);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {value?.map((file, index) => (
          <div 
            key={index} 
            className={`relative aspect-video rounded-lg border-2 overflow-hidden group cursor-move transition-all ${
              draggedIndex === index ? 'opacity-50 scale-95' : ''
            } ${
              dragOverIndex === index ? 'border-primary border-dashed' : 'border-border'
            }`}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
          >
            <img
              src={URL.createObjectURL(file)}
              alt={`תמונה ${index + 1}`}
              className="object-cover w-full h-full"
            />
            
            {/* Primary image indicator */}
            {index === primaryImageIndex && (
              <div className="absolute top-2 left-2 bg-yellow-500 text-white p-1.5 rounded-full shadow-lg">
                <Star className="h-4 w-4 fill-white" />
              </div>
            )}
            
            {/* Drag handle */}
            <div className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-move">
              <GripVertical className="h-4 w-4" />
            </div>
            
            {/* Actions */}
            <div className="absolute bottom-2 left-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {index !== primaryImageIndex && (
                <button
                  type="button"
                  onClick={() => setPrimaryImage(index)}
                  className="flex-1 bg-yellow-500/90 hover:bg-yellow-500 text-white text-xs py-1.5 px-2 rounded flex items-center justify-center gap-1 transition-colors"
                  title="הגדר כתמונה ראשית"
                >
                  <Star className="h-3 w-3" />
                  <span>ראשית</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="bg-red-500/90 hover:bg-red-500 text-white p-1.5 rounded transition-colors"
                title="מחק תמונה"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
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
        <div className="text-xs text-muted-foreground text-center space-y-1">
          <p>נבחרו {value.length} תמונות</p>
          <p className="flex items-center justify-center gap-1">
            <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
            התמונה הראשונה תוצג בגריד | גרור תמונות לשינוי סדר
          </p>
        </div>
      ) : null}
    </div>
  );
}

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ImageIcon, Upload, X, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';

interface CompanyLogoUploadProps {
  currentLogoUrl: string | null;
  onLogoChange: (url: string | null) => void;
}

export function CompanyLogoUpload({ currentLogoUrl, onLogoChange }: CompanyLogoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentLogoUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('נא להעלות קובץ תמונה בלבד');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('גודל הקובץ חייב להיות עד 2MB');
      return;
    }

    setIsUploading(true);

    try {
      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/company-logo.${fileExt}`;

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      // Get a signed URL (bucket is private, so getPublicUrl won't work)
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from('documents')
        .createSignedUrl(fileName, 60 * 60 * 24 * 365); // 1 year

      if (signedUrlError || !signedUrlData?.signedUrl) {
        throw signedUrlError || new Error('Failed to get signed URL');
      }

      const signedUrl = signedUrlData.signedUrl;
      
      setPreviewUrl(signedUrl);
      onLogoChange(signedUrl);
      toast.success('הלוגו הועלה בהצלחה');
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('שגיאה בהעלאת הלוגו');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveLogo = () => {
    setPreviewUrl(null);
    onLogoChange(null);
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium text-foreground flex items-center gap-2 justify-end">
        לוגו החברה
        <ImageIcon className="h-4 w-4 text-primary" />
      </Label>
      <p className="text-xs text-muted-foreground text-right">
        הלוגו יופיע בראש כל ה-PDFs שתפיק (מומלץ: רקע שקוף, PNG/JPG, עד 2MB)
      </p>
      
      <div className="flex items-center gap-4 justify-end flex-row-reverse">
        {previewUrl ? (
          <div className="relative group">
            <div className="w-32 h-20 rounded-xl border-2 border-primary/20 overflow-hidden bg-white flex items-center justify-center p-2">
              <img 
                src={previewUrl} 
                alt="לוגו החברה" 
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <button
              type="button"
              onClick={handleRemoveLogo}
              className="absolute -top-2 -left-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <div className="w-32 h-20 rounded-xl border-2 border-dashed border-muted-foreground/30 flex items-center justify-center bg-muted/30">
            <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
          </div>
        )}
        
        <div className="flex flex-col gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="rounded-lg"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                מעלה...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                {previewUrl ? 'החלף לוגו' : 'העלה לוגו'}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

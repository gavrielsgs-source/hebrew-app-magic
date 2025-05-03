
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
  file_path: string;
  file_type?: string;
  file_size?: number;
  entity_id?: string;
  entity_type?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

interface UploadDocumentParams {
  file: File;
  name: string;
  type: string;
  entityId?: string;
  entityType?: string;
}

export function useDocuments(entityId?: string, entityType?: string) {
  const queryClient = useQueryClient();

  const fetchDocuments = async () => {
    try {
      let query = supabase
        .from("documents")
        .select("*");
      
      if (entityId && entityType) {
        query = query
          .eq("entity_id", entityId)
          .eq("entity_type", entityType);
      }
      
      const { data, error } = await query.order("created_at", { ascending: false });
      
      if (error) throw error;
      
      return data as Document[];
    } catch (error) {
      console.error("שגיאה בטעינת מסמכים:", error);
      throw error;
    }
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["documents", entityId, entityType],
    queryFn: fetchDocuments,
  });

  const uploadDocument = useMutation({
    mutationFn: async ({ file, name, type, entityId, entityType }: UploadDocumentParams) => {
      try {
        // העלאת הקובץ לstorage
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `documents/${fileName}`;
        
        const { data: fileData, error: uploadError } = await supabase.storage
          .from("documents")
          .upload(filePath, file);
          
        if (uploadError) throw uploadError;
        
        // יצירת ה-URL הציבורי של הקובץ
        const { data: urlData } = supabase.storage
          .from("documents")
          .getPublicUrl(filePath);
          
        // שמירת המידע על המסמך בדאטאבייס
        const { data, error } = await supabase
          .from("documents")
          .insert({
            name,
            type,
            url: urlData.publicUrl,
            file_path: filePath,
            file_type: file.type,
            file_size: file.size,
            entity_id: entityId || null,
            entity_type: entityType || null,
          })
          .select()
          .single();
          
        if (error) throw error;
        
        return data;
      } catch (error) {
        console.error("שגיאה בהעלאת מסמך:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", entityId, entityType] });
    },
    onError: (error) => {
      console.error("שגיאה בהעלאת מסמך:", error);
      toast.error("שגיאה בהעלאת המסמך");
    },
  });

  const deleteDocument = useMutation({
    mutationFn: async (documentId: string) => {
      try {
        // קבלת נתוני המסמך לפני מחיקה
        const { data: document, error: fetchError } = await supabase
          .from("documents")
          .select("file_path")
          .eq("id", documentId)
          .single();
          
        if (fetchError) throw fetchError;
        
        // מחיקת הקובץ מהstorage
        const { error: storageError } = await supabase.storage
          .from("documents")
          .remove([document.file_path]);
          
        if (storageError) throw storageError;
        
        // מחיקת הרשומה מהדאטאבייס
        const { error } = await supabase
          .from("documents")
          .delete()
          .eq("id", documentId);
          
        if (error) throw error;
        
        return { success: true };
      } catch (error) {
        console.error("שגיאה במחיקת מסמך:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", entityId, entityType] });
    },
    onError: (error) => {
      console.error("שגיאה במחיקת מסמך:", error);
      toast.error("שגיאה במחיקת המסמך");
    },
  });

  return {
    documents: data,
    isLoading,
    error,
    uploadDocument,
    deleteDocument
  };
}

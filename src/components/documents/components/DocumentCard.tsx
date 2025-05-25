
import { MoreHorizontal, Link as LinkIcon, Download, MessageCircle, Star, StarOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { DocumentIcon } from "./DocumentIcon";
import { getDocumentTypeLabel, getEntityLabel, truncateFileName } from "../utils/document-utils";
import type { Document } from "@/hooks/use-documents";
import { toast } from "sonner";

interface DocumentCardProps {
  document: Document;
  onDelete: (documentId: string) => void;
  onToggleTemplate: (documentId: string, isTemplate: boolean) => void;
  onSendWhatsApp: (document: Document) => void;
  isDeleting: boolean;
  isMobile: boolean;
  leads?: any[];
  cars?: any[];
}

export function DocumentCard({ 
  document, 
  onDelete, 
  onToggleTemplate,
  onSendWhatsApp,
  isDeleting, 
  isMobile, 
  leads, 
  cars 
}: DocumentCardProps) {
  const isTemplate = document.is_template || false;

  const handleDownload = async () => {
    try {
      const response = await fetch(document.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = document.name;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("המסמך הורד בהצלחה");
    } catch (error) {
      toast.error("שגיאה בהורדת המסמך");
      console.error(error);
    }
  };

  return (
    <div className={`border rounded-lg p-4 h-20 flex items-center justify-between ${isTemplate ? 'border-yellow-300 bg-yellow-50' : ''}`}>
      <div className={`flex items-center gap-2 ${isMobile ? 'gap-1' : 'gap-2'}`}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size={isMobile ? "sm" : "sm"} className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => window.open(document.url, '_blank')}>
              צפייה
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDownload}>
              <Download className="w-4 h-4 ml-2" />
              הורדה
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSendWhatsApp(document)}>
              <MessageCircle className="w-4 h-4 ml-2" />
              שליחה בוואטסאפ
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onToggleTemplate(document.id, !isTemplate)}>
              {isTemplate ? (
                <>
                  <StarOff className="w-4 h-4 ml-2" />
                  הסרה מתבניות
                </>
              ) : (
                <>
                  <Star className="w-4 h-4 ml-2" />
                  שמירה כתבנית
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onDelete(document.id)}
              disabled={isDeleting}
              className="text-red-600"
            >
              מחיקה
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="flex items-center gap-2 text-right flex-1 min-w-0">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium truncate text-right flex items-center gap-2" title={document.name}>
            {truncateFileName(document.name, 30)}
            {isTemplate && <Star className="w-4 h-4 text-yellow-500 flex-shrink-0" />}
          </h4>
          <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
            <span>{getDocumentTypeLabel(document.type)}</span>
            <span>•</span>
            <span>{new Date(document.created_at).toLocaleDateString('he-IL')}</span>
            {isTemplate && (
              <>
                <span>•</span>
                <span className="text-yellow-600 font-medium">תבנית</span>
              </>
            )}
          </div>
          
          {(document.entity_id && document.entity_type) && (
            <div className="flex items-center justify-end text-xs text-muted-foreground gap-1 mt-1">
              <span className="truncate">{getEntityLabel(document.entity_id, document.entity_type, leads, cars)}</span>
              <LinkIcon className="h-3 w-3 flex-shrink-0" />
            </div>
          )}
        </div>
        <DocumentIcon fileType={document.file_type || ''} />
      </div>
    </div>
  );
}

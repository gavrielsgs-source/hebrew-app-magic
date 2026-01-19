
import { MoreHorizontal, Link as LinkIcon, Download, MessageCircle, Star, StarOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { DocumentTypeIcon } from "./DocumentTypeIcon";
import { getDocumentTypeLabel, getEntityLabel } from "../utils/document-utils";
import type { Document } from "@/hooks/use-documents";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

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

  const getDocumentTypeColor = (type: string) => {
    switch (type) {
      case 'contract': return 'bg-blue-50/80 border-blue-200/50 dark:bg-blue-950/30 dark:border-blue-800/30';
      case 'insurance': return 'bg-green-50/80 border-green-200/50 dark:bg-green-950/30 dark:border-green-800/30';
      case 'license': return 'bg-yellow-50/80 border-yellow-200/50 dark:bg-yellow-950/30 dark:border-yellow-800/30';
      case 'invoice': return 'bg-purple-50/80 border-purple-200/50 dark:bg-purple-950/30 dark:border-purple-800/30';
      case 'id': return 'bg-orange-50/80 border-orange-200/50 dark:bg-orange-950/30 dark:border-orange-800/30';
      default: return 'bg-muted/50 border-muted-foreground/10';
    }
  };

  return (
    <div className={`border rounded-2xl p-4 h-24 flex items-center justify-between transition-all hover:shadow-md hover:scale-[1.01] ${
      isTemplate ? 'border-yellow-300/50 bg-yellow-50/80 dark:bg-yellow-950/30' : getDocumentTypeColor(document.type)
    }`}>
      <div className={`flex items-center gap-2 ${isMobile ? 'gap-1' : 'gap-2'}`}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-xl hover:bg-background/80">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="start" 
            className="rounded-xl bg-popover shadow-lg border z-50 min-w-[160px]"
          >
            <DropdownMenuItem 
              onClick={() => window.open(document.url, '_blank')}
              className="text-right justify-end rounded-lg"
            >
              צפייה
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleDownload}
              className="text-right justify-end rounded-lg"
            >
              הורדה
              <Download className="w-4 h-4 mr-2" />
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onSendWhatsApp(document)}
              className="text-right justify-end rounded-lg"
            >
              שליחה בוואטסאפ
              <MessageCircle className="w-4 h-4 mr-2" />
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onToggleTemplate(document.id, !isTemplate)}
              className="text-right justify-end rounded-lg"
            >
              {isTemplate ? (
                <>
                  הסרה מתבניות
                  <StarOff className="w-4 h-4 mr-2" />
                </>
              ) : (
                <>
                  שמירה כתבנית
                  <Star className="w-4 h-4 mr-2" />
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onDelete(document.id)}
              disabled={isDeleting}
              className="text-red-600 text-right justify-end rounded-lg"
            >
              מחיקה
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="flex items-center gap-3 text-right flex-1 min-w-0">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-end gap-2 mb-1">
            <h3 className="font-semibold text-lg text-gray-800">
              {getDocumentTypeLabel(document.type)}
            </h3>
            {isTemplate && <Star className="w-4 h-4 text-yellow-500 flex-shrink-0" />}
          </div>
          
          <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground mb-1">
            <span>{new Date(document.created_at).toLocaleDateString('he-IL')}</span>
            {isTemplate && (
              <>
                <span>•</span>
                <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                  תבנית
                </Badge>
              </>
            )}
          </div>
          
          {(document.entity_id && document.entity_type) && (
            <div className="flex items-center justify-end text-xs text-blue-600 gap-1">
              <span className="truncate font-medium">{getEntityLabel(document.entity_id, document.entity_type, leads, cars)}</span>
              <LinkIcon className="h-3 w-3 flex-shrink-0" />
            </div>
          )}
        </div>
        <DocumentTypeIcon type={document.type} className="w-8 h-8 flex-shrink-0" />
      </div>
    </div>
  );
}

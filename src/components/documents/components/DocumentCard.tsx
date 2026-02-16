
import { MoreHorizontal, Download, MessageCircle, Star, StarOff, Calendar, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { DocumentTypeIcon, getIconBgColor, getTypeBadgeClasses } from "./DocumentTypeIcon";
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

  const entityLabel = (document.entity_id && document.entity_type) 
    ? getEntityLabel(document.entity_id, document.entity_type, leads, cars) 
    : null;

  return (
    <div className={`border rounded-2xl p-5 flex items-start gap-4 transition-all hover:shadow-lg hover:scale-[1.01] bg-card ${
      isTemplate ? 'border-yellow-300/50 ring-1 ring-yellow-200/50' : 'border-border/50'
    }`}>
      {/* Icon */}
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${getIconBgColor(document.type)}`}>
        <DocumentTypeIcon type={document.type} className="w-6 h-6" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 text-right">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-xl hover:bg-muted flex-shrink-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="rounded-xl bg-popover shadow-lg border z-50 min-w-[160px]">
              <DropdownMenuItem onClick={() => window.open(document.url, '_blank')} className="text-right justify-end rounded-lg">
                צפייה
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownload} className="text-right justify-end rounded-lg">
                הורדה
                <Download className="w-4 h-4 mr-2" />
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSendWhatsApp(document)} className="text-right justify-end rounded-lg">
                שליחה בוואטסאפ
                <MessageCircle className="w-4 h-4 mr-2" />
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onToggleTemplate(document.id, !isTemplate)} className="text-right justify-end rounded-lg">
                {isTemplate ? (
                  <>הסרה מתבניות<StarOff className="w-4 h-4 mr-2" /></>
                ) : (
                  <>שמירה כתבנית<Star className="w-4 h-4 mr-2" /></>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDelete(document.id)} disabled={isDeleting} className="text-red-600 text-right justify-end rounded-lg">
                מחיקה
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <h3 className="font-semibold text-base text-foreground truncate flex-1">
            {document.name}
          </h3>
        </div>

        <div className="flex items-center justify-end gap-2 mb-2">
          <Badge variant="secondary" className={`text-xs border-0 ${getTypeBadgeClasses(document.type)}`}>
            {getDocumentTypeLabel(document.type)}
          </Badge>
          {isTemplate && (
            <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800 border-0">
              <Star className="w-3 h-3 ml-1" />
              תבנית
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-end gap-4 text-xs text-muted-foreground">
          {document.created_at && (
            <span className="flex items-center gap-1">
              {new Date(document.created_at).toLocaleDateString('he-IL')}
              <Calendar className="w-3.5 h-3.5" />
            </span>
          )}
          {entityLabel && (
            <span className="flex items-center gap-1 text-primary/80 font-medium truncate">
              {entityLabel}
              <LinkIcon className="w-3.5 h-3.5 flex-shrink-0" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

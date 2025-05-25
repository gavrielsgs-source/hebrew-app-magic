
import { MoreHorizontal, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DocumentIcon } from "./DocumentIcon";
import { getDocumentTypeLabel, getEntityLabel, truncateFileName } from "../utils/document-utils";
import type { Document } from "@/hooks/use-documents";

interface DocumentCardProps {
  document: Document;
  onDelete: (documentId: string) => void;
  isDeleting: boolean;
  isMobile: boolean;
  leads?: any[];
  cars?: any[];
}

export function DocumentCard({ 
  document, 
  onDelete, 
  isDeleting, 
  isMobile, 
  leads, 
  cars 
}: DocumentCardProps) {
  return (
    <div className="border rounded-lg p-4 h-20 flex items-center justify-between">
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
            <DropdownMenuItem 
              onClick={() => onDelete(document.id)}
              disabled={isDeleting}
            >
              מחיקה
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="flex items-center gap-2 text-right flex-1 min-w-0">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium truncate text-right" title={document.name}>
            {truncateFileName(document.name, 30)}
          </h4>
          <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
            <span>{getDocumentTypeLabel(document.type)}</span>
            <span>•</span>
            <span>{new Date(document.created_at).toLocaleDateString('he-IL')}</span>
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

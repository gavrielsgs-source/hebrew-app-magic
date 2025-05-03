
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { FileIcon, FileTextIcon, Image, MoreHorizontal, Search, Upload, X } from "lucide-react";
import { useDocuments } from "@/hooks/use-documents";

interface DocumentsManagerProps {
  entityId?: string;
  entityType?: 'lead' | 'car' | 'agency';
}

export function DocumentsManager({ entityId, entityType }: DocumentsManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [documentTypeFilter, setDocumentTypeFilter] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState("");
  const [documentType, setDocumentType] = useState<string>("contract");
  
  const { documents, isLoading, error, uploadDocument, deleteDocument } = useDocuments(entityId, entityType);
  
  // סינון מסמכים לפי החיפוש והסוג
  const filteredDocuments = documents?.filter(doc => {
    const matchesSearch = !searchQuery || doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !documentTypeFilter || doc.type === documentTypeFilter;
    return matchesSearch && matchesType;
  });
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // אם שם המסמך ריק, השתמש בשם הקובץ
      if (!documentName) {
        setDocumentName(selectedFile.name.split('.')[0]);
      }
    }
  };
  
  const handleUpload = async () => {
    if (!file) {
      toast.error("יש לבחור קובץ");
      return;
    }
    
    if (!documentName) {
      toast.error("יש להזין שם למסמך");
      return;
    }
    
    try {
      await uploadDocument({
        file,
        name: documentName,
        type: documentType,
        entityId,
        entityType,
      });
      
      toast.success("המסמך הועלה בהצלחה");
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error("שגיאה בהעלאת המסמך");
      console.error(error);
    }
  };
  
  const handleDelete = async (documentId: string) => {
    try {
      await deleteDocument(documentId);
      toast.success("המסמך נמחק בהצלחה");
    } catch (error) {
      toast.error("שגיאה במחיקת המסמך");
      console.error(error);
    }
  };
  
  const resetForm = () => {
    setFile(null);
    setDocumentName("");
    setDocumentType("contract");
  };
  
  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'contract': return 'חוזה';
      case 'id': return 'תעודת זהות';
      case 'license': return 'רישיון';
      case 'invoice': return 'חשבונית';
      case 'insurance': return 'ביטוח';
      case 'other': return 'אחר';
      default: return type;
    }
  };
  
  const getDocumentIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <Image className="h-6 w-6 text-blue-500" />;
    } else if (fileType === 'application/pdf') {
      return <FileTextIcon className="h-6 w-6 text-red-500" />;
    } else {
      return <FileIcon className="h-6 w-6 text-gray-500" />;
    }
  };
  
  if (error) {
    return (
      <div className="p-4 border rounded-lg">
        <p className="text-red-500">שגיאה בטעינת מסמכים: {error.message}</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="חפש מסמכים..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={documentTypeFilter} onValueChange={setDocumentTypeFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="סוג מסמך" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">הכל</SelectItem>
              <SelectItem value="contract">חוזה</SelectItem>
              <SelectItem value="id">תעודת זהות</SelectItem>
              <SelectItem value="license">רישיון</SelectItem>
              <SelectItem value="invoice">חשבונית</SelectItem>
              <SelectItem value="insurance">ביטוח</SelectItem>
              <SelectItem value="other">אחר</SelectItem>
            </SelectContent>
          </Select>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-1">
                <Upload className="h-4 w-4" />
                העלאת מסמך
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>העלאת מסמך חדש</DialogTitle>
                <DialogDescription>
                  העלה מסמכים כמו חוזים, רישיונות, חשבוניות ועוד.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="documentName">שם המסמך</Label>
                  <Input
                    id="documentName"
                    value={documentName}
                    onChange={(e) => setDocumentName(e.target.value)}
                    placeholder="לדוגמה: חוזה מכירה - יונדאי i10"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="documentType">סוג המסמך</Label>
                  <Select value={documentType} onValueChange={setDocumentType}>
                    <SelectTrigger>
                      <SelectValue placeholder="בחר סוג מסמך" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contract">חוזה</SelectItem>
                      <SelectItem value="id">תעודת זהות</SelectItem>
                      <SelectItem value="license">רישיון</SelectItem>
                      <SelectItem value="invoice">חשבונית</SelectItem>
                      <SelectItem value="insurance">ביטוח</SelectItem>
                      <SelectItem value="other">אחר</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="file">קובץ</Label>
                  <div className="border rounded-lg p-4">
                    <Input
                      id="file"
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    
                    {file ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 overflow-hidden">
                          {getDocumentIcon(file.type)}
                          <span className="truncate">{file.name}</span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setFile(null)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Label htmlFor="file" className="cursor-pointer block">
                          <div className="py-4 flex flex-col items-center gap-2 text-muted-foreground">
                            <Upload className="h-8 w-8" />
                            <span>לחץ לבחירת קובץ או גרור לכאן</span>
                            <span className="text-xs">
                              PDF, תמונות ומסמכי משרד נתמכים
                            </span>
                          </div>
                        </Label>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={resetForm}>איפוס</Button>
                <Button onClick={handleUpload} disabled={!file || !documentName}>
                  העלאה
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {isLoading ? (
        <div className="text-center p-8">
          <p className="text-muted-foreground">טוען מסמכים...</p>
        </div>
      ) : filteredDocuments?.length === 0 ? (
        <div className="text-center border rounded-lg p-8">
          <p className="text-muted-foreground mb-2">לא נמצאו מסמכים</p>
          <p className="text-sm text-muted-foreground">העלה מסמכים חדשים באמצעות כפתור "העלאת מסמך"</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {filteredDocuments?.map((document) => (
              <div key={document.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getDocumentIcon(document.file_type || '')}
                    <div>
                      <h4 className="font-medium truncate" title={document.name}>
                        {document.name}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {getDocumentTypeLabel(document.type)}
                      </p>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => window.open(document.url, '_blank')}>
                        צפייה
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(document.id)}>
                        מחיקה
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  הועלה ב-{new Date(document.created_at).toLocaleDateString('he-IL')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

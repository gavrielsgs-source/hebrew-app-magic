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
import { FileIcon, FileTextIcon, Image, MoreHorizontal, Search, Upload, X, Link as LinkIcon } from "lucide-react";
import { useDocuments, type UploadDocumentParams } from "@/hooks/use-documents";
import { useLeads } from "@/hooks/use-leads";
import { useCars } from "@/hooks/use-cars";
import { useIsMobile } from "@/hooks/use-mobile";

interface DocumentsManagerProps {
  entityId?: string;
  entityType?: 'lead' | 'car' | 'agency';
}

export function DocumentsManager({ entityId, entityType }: DocumentsManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [documentTypeFilter, setDocumentTypeFilter] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState("");
  const [documentType, setDocumentType] = useState<string>("contract");
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(entityId || null);
  const [selectedEntityType, setSelectedEntityType] = useState<'lead' | 'car' | 'agency' | null>(entityType || null);
  
  const isMobile = useIsMobile();
  
  const { documents, isLoading, error, uploadDocument, deleteDocument, isUploading, isDeleting } = useDocuments(
    selectedEntityId || entityId, 
    selectedEntityType || entityType
  );
  
  // שליפת לידים ורכבים לצורך קישור מסמכים
  const { leads, isLoading: isLeadsLoading } = useLeads();
  const { cars, isLoading: isCarsLoading } = useCars();
  
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
      const params: UploadDocumentParams = {
        file,
        name: documentName,
        type: documentType,
        entityId: selectedEntityId || entityId,
        entityType: selectedEntityType || entityType,
      };
      
      await uploadDocument(params);
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
    if (!entityId && !entityType) {
      setSelectedEntityId(null);
      setSelectedEntityType(null);
    }
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
  
  const getEntityLabel = (id: string | null, type: string | null) => {
    if (!id || !type) return "לא משויך";
    
    if (type === 'lead') {
      const lead = leads?.find(l => l.id === id);
      return lead ? `לקוח: ${lead.name}` : "לקוח לא ידוע";
    } else if (type === 'car') {
      const car = cars?.find(c => c.id === id);
      return car ? `רכב: ${car.make} ${car.model}` : "רכב לא ידוע";
    } else if (type === 'agency') {
      return "סוכנות";
    }
    
    return "לא משויך";
  };
  
  const getDocumentIcon = (fileType: string) => {
    if (fileType?.startsWith('image/')) {
      return <Image className="h-5 w-5 text-blue-500 flex-shrink-0" />;
    } else if (fileType === 'application/pdf') {
      return <FileTextIcon className="h-5 w-5 text-red-500 flex-shrink-0" />;
    } else {
      return <FileIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />;
    }
  };
  
  const truncateFileName = (name: string, maxLength: number = 30) => {
    if (name.length <= maxLength) return name;
    return name.slice(0, maxLength) + '...';
  };
  
  if (error) {
    return (
      <div className="p-4 border rounded-lg">
        <p className="text-red-500 text-right">שגיאה בטעינת מסמכים: {error.message}</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="חפש מסמכים..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-9 text-right"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={documentTypeFilter || "all"} onValueChange={(value) => setDocumentTypeFilter(value === "all" ? null : value)}>
            <SelectTrigger className="w-[150px] text-right">
              <SelectValue placeholder="סוג מסמך" />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="all">הכל</SelectItem>
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
                <Upload className="h-4 w-4 ml-1" />
                העלאת מסמך
              </Button>
            </DialogTrigger>
            <DialogContent dir="rtl">
              <DialogHeader>
                <DialogTitle className="text-right">העלאת מסמך חדש</DialogTitle>
                <DialogDescription className="text-right">
                  העלה מסמכים כמו חוזים, רישיונות, חשבוניות ועוד.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="documentName" className="block text-right">שם המסמך</Label>
                  <Input
                    id="documentName"
                    value={documentName}
                    onChange={(e) => setDocumentName(e.target.value)}
                    placeholder="לדוגמה: חוזה מכירה - יונדאי i10"
                    className="text-right"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="documentType" className="block text-right">סוג המסמך</Label>
                  <Select value={documentType} onValueChange={setDocumentType}>
                    <SelectTrigger className="text-right">
                      <SelectValue placeholder="בחר סוג מסמך" />
                    </SelectTrigger>
                    <SelectContent align="end">
                      <SelectItem value="contract">חוזה</SelectItem>
                      <SelectItem value="id">תעודת זהות</SelectItem>
                      <SelectItem value="license">רישיון</SelectItem>
                      <SelectItem value="invoice">חשבונית</SelectItem>
                      <SelectItem value="insurance">ביטוח</SelectItem>
                      <SelectItem value="other">אחר</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* בחירת ישות לקישור מסמך (רק אם לא הועבר מראש) */}
                {!entityId && !entityType && (
                  <div className="space-y-2">
                    <Label htmlFor="entityType" className="block text-right">שייך מסמך אל</Label>
                    <Select 
                      value={selectedEntityType || "none"} 
                      onValueChange={(value) => {
                        setSelectedEntityId(null);
                        setSelectedEntityType(value === "none" ? null : value as 'lead' | 'car' | 'agency');
                      }}
                    >
                      <SelectTrigger className="text-right">
                        <SelectValue placeholder="בחר סוג ישות" />
                      </SelectTrigger>
                      <SelectContent align="end">
                        <SelectItem value="none">לא משויך</SelectItem>
                        <SelectItem value="lead">לקוח</SelectItem>
                        <SelectItem value="car">רכב</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                {/* בחירת לקוח או רכב ספציפי לקישור */}
                {selectedEntityType === 'lead' && !entityId && (
                  <div className="space-y-2">
                    <Label htmlFor="leadId" className="block text-right">בחר לקוח</Label>
                    <Select 
                      value={selectedEntityId || ""} 
                      onValueChange={setSelectedEntityId}
                      disabled={isLeadsLoading}
                    >
                      <SelectTrigger className="text-right">
                        <SelectValue placeholder="בחר לקוח" />
                      </SelectTrigger>
                      <SelectContent align="end">
                        {leads?.map(lead => (
                          <SelectItem key={lead.id} value={lead.id}>
                            {lead.name} {lead.phone ? `(${lead.phone})` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {isLeadsLoading && <p className="text-sm text-muted-foreground text-right">טוען לקוחות...</p>}
                  </div>
                )}
                
                {selectedEntityType === 'car' && !entityId && (
                  <div className="space-y-2">
                    <Label htmlFor="carId" className="block text-right">בחר רכב</Label>
                    <Select 
                      value={selectedEntityId || ""} 
                      onValueChange={setSelectedEntityId}
                      disabled={isCarsLoading}
                    >
                      <SelectTrigger className="text-right">
                        <SelectValue placeholder="בחר רכב" />
                      </SelectTrigger>
                      <SelectContent align="end">
                        {cars?.map(car => (
                          <SelectItem key={car.id} value={car.id}>
                            {car.make} {car.model} {car.year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {isCarsLoading && <p className="text-sm text-muted-foreground text-right">טוען רכבים...</p>}
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="file" className="block text-right">קובץ</Label>
                  <div className="border rounded-lg p-4">
                    <Input
                      id="file"
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    
                    {file ? (
                      <div className="flex items-center justify-between">
                        <Button variant="ghost" size="sm" onClick={() => setFile(null)}>
                          <X className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center gap-2 overflow-hidden">
                          <span className="truncate">{file.name}</span>
                          {getDocumentIcon(file.type)}
                        </div>
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
              
              <DialogFooter className="flex-row sm:justify-start">
                <Button variant="outline" onClick={resetForm}>איפוס</Button>
                <Button 
                  onClick={handleUpload}
                  disabled={!file || !documentName || isUploading || (selectedEntityType && !selectedEntityId)}
                >
                  {isUploading ? "מעלה..." : "העלאה"}
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
          <div className={`grid gap-4 p-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
            {filteredDocuments?.map((document) => (
              <div key={document.id} className="border rounded-lg p-4 h-20 flex items-center justify-between">
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
                        onClick={() => handleDelete(document.id)}
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
                    
                    {/* שיוך המסמך ללקוח/רכב */}
                    {(document.entity_id && document.entity_type) && (
                      <div className="flex items-center justify-end text-xs text-muted-foreground gap-1 mt-1">
                        <span className="truncate">{getEntityLabel(document.entity_id, document.entity_type)}</span>
                        <LinkIcon className="h-3 w-3 flex-shrink-0" />
                      </div>
                    )}
                  </div>
                  {getDocumentIcon(document.file_type || '')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

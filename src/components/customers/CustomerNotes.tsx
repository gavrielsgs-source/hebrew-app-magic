import { useState } from "react";
import { MessageSquare, Plus, Calendar, Sparkles, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useCustomerNotes, useCreateCustomerNote } from "@/hooks/customers";
import { formatDistanceToNow } from "date-fns";
import { he } from "date-fns/locale";

interface CustomerNotesProps {
  customerId: string;
}

export function CustomerNotes({ customerId }: CustomerNotesProps) {
  const [newNote, setNewNote] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  
  const { data: notes = [], isLoading } = useCustomerNotes(customerId);
  const createNote = useCreateCustomerNote();

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    
    try {
      await createNote.mutateAsync({ customerId, note: newNote.trim() });
      setNewNote("");
      setIsAdding(false);
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  return (
    <Card className="shadow-xl rounded-2xl border-0 bg-gradient-to-br from-white/95 to-blue-50/95 backdrop-blur-md hover:shadow-2xl transition-all duration-500">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl blur-sm"></div>
              <div className="relative bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-2.5 rounded-xl">
                <Sparkles className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div>
              <CardTitle className="text-base font-bold text-slate-800 mb-0.5">
                הערות לקוח
              </CardTitle>
              <CardDescription className="text-sm text-slate-600">
                {notes.length > 0 ? `${notes.length} הערות נרשמו` : 'טרם נוספו הערות'}
              </CardDescription>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsAdding(!isAdding)}
            className="rounded-xl border-2 hover:shadow-md transition-all duration-300"
          >
            <Plus className="h-4 w-4 ml-1" />
            <span className="text-sm font-medium">הוסף הערה</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isAdding && (
          <div className="mb-3 p-3 border border-dashed rounded-lg space-y-2">
            <Textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="הזן הערה חדשה..."
              rows={3}
              className="text-sm"
            />
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={handleAddNote}
                disabled={!newNote.trim() || createNote.isPending}
                className="text-sm"
              >
                {createNote.isPending ? 'שומר...' : 'שמור הערה'}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setIsAdding(false);
                  setNewNote("");
                }}
                className="text-sm"
              >
                ביטול
              </Button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-3 bg-muted rounded w-1/4 mb-2"></div>
                <div className="h-12 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-lg opacity-10"></div>
              <div className="relative">
                <MessageSquare className="h-10 w-10 mx-auto mb-3 text-blue-400" />
              </div>
            </div>
            <h3 className="text-base font-bold text-slate-700 mb-2">אין הערות עדיין</h3>
            <p className="text-sm mb-4 bg-slate-50 rounded-xl px-4 py-2 inline-block">הוסף הערה ראשונה כדי להתחיל לעקוב אחרי הלקוח</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <div key={note.id} className="group border rounded-xl p-4 bg-gradient-to-r from-white to-slate-50/50 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 shadow-sm px-2 py-1 rounded-full">
                    <Clock className="h-3 w-3 ml-1" />
                    {formatDistanceToNow(new Date(note.created_at), { 
                      addSuffix: true, 
                      locale: he 
                    })}
                  </Badge>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-slate-700">{note.note}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

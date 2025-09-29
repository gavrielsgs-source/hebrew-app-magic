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
    <Card className="shadow-2xl rounded-3xl border-0 bg-gradient-to-br from-white/95 to-blue-50/95 backdrop-blur-md hover:shadow-3xl transition-all duration-500">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl blur-sm"></div>
              <div className="relative bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-4 rounded-2xl">
                <Sparkles className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <div>
              <CardTitle className="text-3xl font-bold text-slate-800 mb-2">
                💬 הערות לקוח
              </CardTitle>
              <CardDescription className="text-xl text-slate-600">
                {notes.length > 0 ? `${notes.length} הערות נרשמו` : 'טרם נוספו הערות'}
              </CardDescription>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => setIsAdding(!isAdding)}
            className="rounded-2xl border-2 hover:shadow-lg transition-all duration-300"
          >
            <Plus className="h-5 w-5 ml-2" />
            <span className="text-lg font-medium">הוסף הערה</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isAdding && (
          <div className="mb-4 p-4 border border-dashed rounded-lg space-y-3">
            <Textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="הזן הערה חדשה..."
              rows={3}
            />
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={handleAddNote}
                disabled={!newNote.trim() || createNote.isPending}
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
              >
                ביטול
              </Button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
                <div className="h-16 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-lg opacity-10"></div>
              <div className="relative">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 text-blue-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-700 mb-3">אין הערות עדיין</h3>
            <p className="text-lg mb-6 bg-slate-50 rounded-2xl px-6 py-3 inline-block">הוסף הערה ראשונה כדי להתחיל לעקוב אחרי הלקוח</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => (
              <div key={note.id} className="group border rounded-2xl p-6 bg-gradient-to-r from-white to-slate-50/50 shadow-sm hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="outline" className="text-base bg-blue-50 text-blue-700 border-blue-200 shadow-sm px-4 py-2 rounded-full">
                    <Clock className="h-4 w-4 ml-2" />
                    {formatDistanceToNow(new Date(note.created_at), { 
                      addSuffix: true, 
                      locale: he 
                    })}
                  </Badge>
                </div>
                <p className="text-lg leading-relaxed whitespace-pre-wrap text-slate-700">{note.note}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
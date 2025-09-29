import { useState } from "react";
import { MessageSquare, Plus, Calendar } from "lucide-react";
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              הערות לקוח
            </CardTitle>
            <CardDescription>
              {notes.length > 0 ? `${notes.length} הערות` : 'אין הערות עדיין'}
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsAdding(!isAdding)}
          >
            <Plus className="h-4 w-4 ml-2" />
            הוסף הערה
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
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>אין הערות עדיין</p>
            <p className="text-sm">הוסף הערה ראשונה כדי להתחיל לעקוב אחרי הלקוח</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <div key={note.id} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    <Calendar className="h-3 w-3 ml-1" />
                    {formatDistanceToNow(new Date(note.created_at), { 
                      addSuffix: true, 
                      locale: he 
                    })}
                  </Badge>
                </div>
                <p className="text-sm whitespace-pre-wrap">{note.note}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
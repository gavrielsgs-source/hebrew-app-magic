
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export interface LeadScore {
  leadId: string;
  score: number; // ציון בין 0-100
  factors: {
    type: string;
    impact: number; // השפעה חיובית או שלילית על הציון
    description: string;
  }[];
  category: 'hot' | 'warm' | 'cold';
  lastUpdated: string;
}

// חישוב קטגוריית הליד על פי הציון
const calculateCategory = (score: number): 'hot' | 'warm' | 'cold' => {
  if (score >= 70) return 'hot';
  if (score >= 40) return 'warm';
  return 'cold';
};

// פונקציה לחישוב ציון הליד
const calculateLeadScore = (lead: any): LeadScore => {
  const factors: LeadScore['factors'] = [];
  let score = 50; // ציון התחלתי

  // גורמי השפעה על הציון
  // מקור הליד
  if (lead.source) {
    const sourceImpact = lead.source === 'פייסבוק' ? 10 : 
                         lead.source === 'אתר' ? 15 :
                         lead.source === 'המלצה' ? 20 : 5;
    
    factors.push({
      type: 'source',
      impact: sourceImpact,
      description: `מקור: ${lead.source}`
    });
    
    score += sourceImpact;
  }
  
  // האם ישנן שיחות או מעקב אחרי הליד
  if (lead.follow_up_notes && lead.follow_up_notes.length > 0) {
    const followUpImpact = Math.min(lead.follow_up_notes.length * 5, 15);
    factors.push({
      type: 'follow_up',
      impact: followUpImpact,
      description: `${lead.follow_up_notes.length} פעולות מעקב`
    });
    
    score += followUpImpact;
  } else {
    factors.push({
      type: 'follow_up',
      impact: -10,
      description: 'אין פעולות מעקב'
    });
    
    score -= 10;
  }
  
  // האם הליד מתעניין ברכב ספציפי
  if (lead.car_id) {
    factors.push({
      type: 'car_interest',
      impact: 15,
      description: 'התעניינות ברכב ספציפי'
    });
    
    score += 15;
  }
  
  // כמה זמן הליד במערכת ללא התקדמות
  const createdAt = new Date(lead.created_at);
  const now = new Date();
  const daysSinceCreation = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
  
  if (lead.status === 'new' && daysSinceCreation > 14) {
    const ageImpact = Math.min(-5 * Math.floor(daysSinceCreation / 7), -15);
    factors.push({
      type: 'age',
      impact: ageImpact,
      description: `ליד לא פעיל מעל ${daysSinceCreation} ימים`
    });
    
    score += ageImpact;
  }
  
  // סטטוס הליד
  if (lead.status) {
    const statusImpact = lead.status === 'in_progress' ? 10 : 
                         lead.status === 'waiting' ? 0 : -5;
    
    factors.push({
      type: 'status',
      impact: statusImpact,
      description: `סטטוס: ${lead.status}`
    });
    
    score += statusImpact;
  }
  
  // וודא שהציון בטווח 0-100
  score = Math.max(0, Math.min(100, score));
  
  return {
    leadId: lead.id,
    score,
    factors,
    category: calculateCategory(score),
    lastUpdated: new Date().toISOString(),
  };
};

// Hook לשליפת ציוני לידים
export function useLeadScoring() {
  const queryClient = useQueryClient();
  
  // שליפת כל הלידים וחישוב הציונים שלהם
  const { data: leadScores, isLoading, error } = useQuery({
    queryKey: ["lead-scores"],
    queryFn: async () => {
      try {
        // שליפת כל הלידים
        const { data: leads, error } = await supabase
          .from("leads")
          .select("*");
        
        if (error) throw error;
        
        // חישוב ציון לכל ליד
        const scores = leads.map((lead) => calculateLeadScore(lead));
        
        return scores;
      } catch (error) {
        console.error("שגיאה בטעינת ציוני לידים:", error);
        toast.error("שגיאה בטעינת ציוני לידים");
        return [];
      }
    },
  });
  
  // שליפת ציון של ליד ספציפי לפי ID
  const getLeadScoreById = (leadId: string): LeadScore | undefined => {
    if (!leadScores) return undefined;
    return leadScores.find(score => score.leadId === leadId);
  };
  
  // פילטור לידים לפי קטגוריה
  const filterByCategory = (category: 'hot' | 'warm' | 'cold') => {
    if (!leadScores) return [];
    return leadScores.filter(score => score.category === category);
  };
  
  return {
    leadScores,
    isLoading,
    error,
    getLeadScoreById,
    filterByCategory,
    hotLeads: leadScores ? filterByCategory('hot') : [],
    warmLeads: leadScores ? filterByCategory('warm') : [],
    coldLeads: leadScores ? filterByCategory('cold') : [],
  };
}

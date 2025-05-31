
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";

export interface LeadScore {
  id: string;
  lead_id: string;
  score: number;
  factors: {
    engagement: number;
    timeline: number;
    budget: number;
    interest: number;
  };
  last_calculated: string;
}

export function useLeadScoring() {
  const { user } = useAuth();

  const { data: leadScore, isLoading, error } = useQuery<LeadScore>({
    queryKey: ["lead-scoring", user?.id],
    queryFn: async () => {
      // Since lead scoring table doesn't exist, return mock data
      console.log('Lead scoring table not available, returning mock data for user:', user?.id);
      
      const mockScore: LeadScore = {
        id: "mock-score-1",
        lead_id: "mock-lead-1", 
        score: 85,
        factors: {
          engagement: 90,
          timeline: 80,
          budget: 85,
          interest: 88
        },
        last_calculated: new Date().toISOString()
      };
      
      return mockScore;
    },
    enabled: !!user,
    retry: 1,
  });

  const getLeadScoreById = (leadId: string) => {
    // Return mock score for any lead ID
    return {
      id: `score-${leadId}`,
      lead_id: leadId,
      score: Math.floor(Math.random() * 40) + 60, // Random score between 60-100
      factors: {
        engagement: Math.floor(Math.random() * 40) + 60,
        timeline: Math.floor(Math.random() * 40) + 60,
        budget: Math.floor(Math.random() * 40) + 60,
        interest: Math.floor(Math.random() * 40) + 60
      },
      last_calculated: new Date().toISOString()
    };
  };

  const calculateLeadScore = (leadData: any) => {
    // Simple lead scoring algorithm
    let score = 0;
    
    // Status scoring
    if (leadData.status === 'hot') score += 30;
    else if (leadData.status === 'warm') score += 20;
    else if (leadData.status === 'cold') score += 10;
    
    // Source scoring
    if (leadData.source === 'referral') score += 25;
    else if (leadData.source === 'website') score += 20;
    else if (leadData.source === 'social') score += 15;
    
    // Recency scoring
    const daysSinceCreated = Math.floor(
      (Date.now() - new Date(leadData.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceCreated <= 1) score += 20;
    else if (daysSinceCreated <= 7) score += 15;
    else if (daysSinceCreated <= 30) score += 10;
    
    // Notes/engagement scoring
    if (leadData.notes && leadData.notes.length > 100) score += 15;
    else if (leadData.notes && leadData.notes.length > 50) score += 10;
    
    return Math.min(100, Math.max(0, score));
  };

  return {
    leadScore,
    isLoading,
    error,
    getLeadScoreById,
    calculateLeadScore
  };
}

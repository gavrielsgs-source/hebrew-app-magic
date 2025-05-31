
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";

interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  source: string;
  status: string;
  created_at: string;
}

interface LeadScore {
  score: number;
  category: "hot" | "warm" | "cold";
  factors: Array<{
    description: string;
    impact: number;
  }>;
  lastUpdated: string;
}

const calculateEngagementScore = (lead: Lead): number => {
  let score = 0;
  if (lead.source === "google_ads") {
    score += 5;
  } else if (lead.source === "facebook_ads") {
    score += 3;
  }

  if (lead.status === "new") {
    score += 2;
  }

  return score;
};

const calculateDemographicScore = (lead: Lead): number => {
  let score = 0;
  if (lead.email && lead.email.endsWith("@example.com")) {
    score += 3;
  }

  if (lead.phone && lead.phone.startsWith("050")) {
    score += 2;
  }

  return score;
};

const determineCategory = (overallScore: number): "hot" | "warm" | "cold" => {
  if (overallScore >= 8) {
    return "hot";
  } else if (overallScore >= 5) {
    return "warm";
  } else {
    return "cold";
  }
};

export function useLeadScoring() {
  const { user } = useAuth();

  const { data: leadScores, isLoading, error } = useQuery({
    queryKey: ["lead-scoring", user?.id],
    queryFn: async (): Promise<Record<string, LeadScore>> => {
      if (!user) throw new Error("User not authenticated");

      // Mock implementation - in real app, this would fetch from database
      const mockLeads: Lead[] = [
        {
          id: "1",
          name: "John Doe",
          phone: "0501234567",
          email: "john.doe@example.com",
          source: "google_ads",
          status: "new",
          created_at: new Date().toISOString(),
        }
      ];

      const scores: Record<string, LeadScore> = {};

      mockLeads.forEach(lead => {
        const engagementScore = calculateEngagementScore(lead);
        const demographicScore = calculateDemographicScore(lead);
        const totalScore = engagementScore + demographicScore;

        scores[lead.id] = {
          score: Math.min(totalScore * 10, 100), // Scale to 0-100
          category: determineCategory(totalScore),
          factors: [
            { description: "מקור הליד", impact: engagementScore },
            { description: "נתונים דמוגרפיים", impact: demographicScore }
          ],
          lastUpdated: new Date().toISOString()
        };
      });

      return scores;
    },
    enabled: !!user,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  const getLeadScoreById = (leadId: string): LeadScore | null => {
    return leadScores?.[leadId] || null;
  };

  return {
    leadScores,
    isLoading,
    error,
    getLeadScoreById
  };
}

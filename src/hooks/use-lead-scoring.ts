import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

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
  engagementScore: number;
  demographicScore: number;
  overallScore: number;
  priority: "high" | "medium" | "low";
}

const calculateEngagementScore = (lead: Lead): number => {
  // Example: Score based on lead source
  let score = 0;
  if (lead.source === "google_ads") {
    score += 5;
  } else if (lead.source === "facebook_ads") {
    score += 3;
  }

  // Example: Score based on lead status
  if (lead.status === "new") {
    score += 2;
  }

  return score;
};

const calculateDemographicScore = (lead: Lead): number => {
  // Example: Score based on email domain
  let score = 0;
  if (lead.email.endsWith("@example.com")) {
    score += 3;
  }

  // Example: Score based on phone number
  if (lead.phone.startsWith("050")) {
    score += 2;
  }

  return score;
};

const determinePriority = (overallScore: number): "high" | "medium" | "low" => {
  if (overallScore >= 8) {
    return "high";
  } else if (overallScore >= 5) {
    return "medium";
  } else {
    return "low";
  }
};

export function useLeadScoring() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["lead-scoring", user?.id],
    queryFn: async (): Promise<LeadScore> => {
      if (!user) throw new Error("User not authenticated");

      // Mock lead data for demonstration
      const mockLead: Lead = {
        id: "1",
        name: "John Doe",
        phone: "0501234567",
        email: "john.doe@example.com",
        source: "google_ads",
        status: "new",
        created_at: new Date().toISOString(),
      };

      const engagementScore = calculateEngagementScore(mockLead);
      const demographicScore = calculateDemographicScore(mockLead);
      const overallScore = engagementScore + demographicScore;
      const priority = determinePriority(overallScore);

      return {
        engagementScore,
        demographicScore,
        overallScore,
        priority,
      };
    },
    enabled: !!user,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}

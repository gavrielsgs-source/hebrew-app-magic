
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface FacebookToken {
  id: string;
  user_id: string;
  access_token: string;
  page_id: string;
  page_name: string;
  created_at: string;
}

export function FacebookTokenStorage() {
  const [tokens, setTokens] = useState<FacebookToken[]>([]);
  const { toast } = useToast();

  const saveUserAccessToken = async (accessToken: string, pageId: string, pageName: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      console.log('args:', accessToken, pageId, pageId, user.id)
      const { error } = await supabase.rpc('save_facebook_token', {
        p_access_token: accessToken,
        p_page_id: pageId,
        p_page_name: pageName,
        p_user_id: user.id
      });
      
      if (error) throw error;

      toast({
        title: "הצלחה",
        description: `טוקן נשמר עבור דף ${pageName}`,
      });

      await loadTokens();
    } catch (error: any) {
      console.error('Error saving Facebook token:', error);
      toast({
        title: "שגיאה",
        description: `שגיאה בשמירת הטוקן: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const loadTokens = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.rpc('get_facebook_tokens' as any, {
        p_user_id: user.id
      });

      if (error) throw error;
      
      // Properly type the returned data
      const typedData = data as FacebookToken[];
      setTokens(typedData || []);
    } catch (error) {
      console.error('Error loading Facebook tokens:', error);
    }
  };

  useEffect(() => {
    loadTokens();
  }, []);

  return {
    tokens,
    saveUserAccessToken,
    loadTokens
  };
}

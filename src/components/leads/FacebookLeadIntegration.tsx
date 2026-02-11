import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FacebookTokenStorage } from "./FacebookTokenStorage";

declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

export function FacebookLeadIntegration() {
  const [fbInitialized, setFbInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [connectionStatus, setConnectionStatus] = useState("לא מחובר");
  const { saveUserAccessToken, tokens } = FacebookTokenStorage();

  const addDebugLog = (log: string) => {
    console.log("[FB Debug]:", log);
    setDebugInfo((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${log}`]);
  };

  useEffect(() => {
    addDebugLog("Starting Facebook SDK initialization...");

    if (window.FB) {
      addDebugLog("Facebook SDK already loaded");
      setFbInitialized(true);
      setConnectionStatus("SDK מוכן");
      return;
    }

    addDebugLog("Setting up Facebook SDK...");
    window.fbAsyncInit = () => {
      addDebugLog("Facebook SDK loaded, initializing...");
      window.FB.init({
        appId: "2106125989900776",
        cookie: true,
        xfbml: false,
        version: "v17.0",
      });
      addDebugLog("Facebook SDK initialized successfully");
      setFbInitialized(true);
      setConnectionStatus("SDK מוכן");
    };

    if (!document.getElementById("facebook-jssdk")) {
      addDebugLog("Loading Facebook SDK script...");
      const js = document.createElement("script");
      js.id = "facebook-jssdk";
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      js.onload = () => addDebugLog("Facebook SDK script loaded");
      js.onerror = (e) => {
        const errorMsg = typeof e === "string" ? e : e instanceof ErrorEvent ? e.message : "network or blocked";
        addDebugLog(`ERROR: Failed to load Facebook SDK script (${errorMsg})`);
        console.error("Facebook SDK load error", e);

        // Try fetch as a diagnostic
        fetch(js.src)
          .then((r) => addDebugLog(`Fetch attempt status: ${r.status}`))
          .catch((err) => addDebugLog("Fetch failed: " + err));
      };
      document.head.appendChild(js);
    } else {
      addDebugLog("Facebook SDK script already exists");
    }
  }, []);

  useEffect(() => {
    if (tokens && tokens.length > 0) {
      setConnectionStatus(`מחובר - ${tokens.length} דפים`);
      addDebugLog(`Found ${tokens.length} stored Facebook tokens`);
    }
  }, [tokens]);

  // Helper: promisify FB.api calls
  function fbApi<T = any>(path: string, method = "GET", params?: Record<string, any>): Promise<T> {
    return new Promise((resolve, reject) => {
      window.FB.api(path, method, params, (response: any) => {
        if (!response || response.error) {
          reject(response?.error || new Error("Unknown Facebook API error"));
        } else {
          resolve(response);
        }
      });
    });
  }

  const exchangeForLongLivedToken = async (shortLivedToken: string) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const res = await fetch("https://zjmkdmmnajzevoupgfhg.supabase.co/functions/v1/exchange-for-long-lived-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: process.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ shortLivedToken }),
    });

    const data = await res.json();
    addDebugLog("Edge function response: " + JSON.stringify(data));
    return data.access_token;
  };

  async function subscribePageToWebhook(pageId: string, pageAccessToken: string) {
    return fbApi(`/${pageId}/subscribed_apps`, "POST", {
      access_token: pageAccessToken,
      subscribed_fields: "leadgen",
    });
  }

  const loginAndSubscribe = () => {
    if (!fbInitialized) {
      addDebugLog("ERROR: Facebook SDK not initialized");
      return;
    }

    addDebugLog("Starting Facebook login process...");
    setLoading(true);
    setMessage("");
    setConnectionStatus("מתחבר...");

    window.FB.login(
      function (response: any) {
        addDebugLog(`Facebook login response: ${JSON.stringify(response)}`);

        if (response.authResponse) {
          const userAccessToken = response.authResponse.accessToken;
          addDebugLog("Successfully obtained user access token");
          addDebugLog(userAccessToken);
          setConnectionStatus("מקבל נתוני דפים...");

          (async () => {
            try {
              addDebugLog("Exchanging user token for long-lived version...");
              const longLivedUserToken = await exchangeForLongLivedToken(userAccessToken);
              addDebugLog("Successfully obtained long-lived user token");

              addDebugLog("Fetching user pages...");
              const pagesResponse = await fbApi<{ data: Array<{ id: string; access_token: string; name: string }> }>(
                "/me/accounts",
                "GET",
                {
                  access_token: longLivedUserToken,
                },
              );
              addDebugLog(`Found ${pagesResponse.data.length} pages`);
              const user = supabase.auth.getUser ? (await supabase.auth.getUser()).data.user : null;
              for (const page of pagesResponse.data) {
                addDebugLog(JSON.stringify(page, null, 2));
                addDebugLog(`Processing page: ${page.name} (${page.id})`);
                setConnectionStatus(`מעבד דף: ${page.name}`);

                // Exchange page token for long-lived version
                addDebugLog(`Exchanging page token for long-lived version: ${page.name}`);
                const longLivedPageToken = await exchangeForLongLivedToken(page.access_token);

                // שמירת הטוקן הארוך של הדף
                addDebugLog(`token for page: ${longLivedPageToken}`);
                await saveUserAccessToken(longLivedPageToken, page.id, page.name);
                addDebugLog(`Saved long-lived token for page: ${page.name}`);

                await subscribePageToWebhook(page.id, longLivedPageToken);
                addDebugLog(`Subscribed page ${page.name} to webhook`);

                const leadFormsResponse = await fbApi<{ data: Array<{ id: string }> }>(
                  `/${page.id}/leadgen_forms`,
                  "GET",
                  {
                    access_token: longLivedPageToken,
                  },
                );

                const leadForms = leadFormsResponse.data || [];
                addDebugLog(`Found ${leadForms.length} lead forms for page ${page.name}`);

                const {
                  data: { user },
                } = await supabase.auth.getUser();
                if (!user) throw new Error("User not authenticated");
                const userId = user.id;

                for (const form of leadForms) {
                  const leadsResponse = await fbApi<{ data: any[] }>(`/${form.id}/leads`, "GET", {
                    access_token: longLivedPageToken,
                  });
                  const leads = leadsResponse.data || [];
                  addDebugLog(`Fetched ${leads.length} leads for form ${form.id}`);

                  for (const lead of leads) {
                    const leadId = lead.id;
                    const leadData = lead;
                    const userId = user.id;

                    const { error } = await supabase.rpc("save_facebook_lead" as any, {
                      p_user_id: userId,
                      p_page_id: page.id,
                      p_lead_id: lead.id,
                      p_lead_data: lead,
                      p_created_at: new Date(lead.created_time),
                    });
                    if (error) {
                      console.error(`Failed to save lead ${leadId}:`, error.message);
                    }
                  }
                }
              }

              setMessage("כל הדפים שלך נרשמו ונטענו כל הלידים בהצלחה! טוקנים נשמרו למערכת.");
              setConnectionStatus(`מחובר - ${pagesResponse.data.length} דפים`);
              addDebugLog("Integration completed successfully");
            } catch (error: any) {
              addDebugLog(`ERROR in integration process: ${error.message || error}`);
              setMessage(`שגיאה בקבלת דפים, הרשמה או טעינת לידים: ${error.message || error}`);
              setConnectionStatus("שגיאה בחיבור");
            } finally {
              setLoading(false);
            }
          })();
        } else {
          addDebugLog("Facebook login was cancelled or failed");
          setMessage("המשתמש ביטל את ההתחברות או לא נתן הרשאות מלאות.");
          setConnectionStatus("חיבור נכשל");
          setLoading(false);
        }
      },
      {
        scope:
          "public_profile,email,pages_show_list,pages_manage_metadata,leads_retrieval,business_management,pages_manage_ads",
      },
    );
  };

  const resetConnection = () => {
    addDebugLog("Resetting Facebook connection...");
    setMessage("");
    setConnectionStatus("מאפס חיבור...");
    setDebugInfo([]);

    // Clear any Facebook auth status
    if (window.FB && window.FB.getAuthResponse) {
      window.FB.logout(() => {
        addDebugLog("Facebook logout completed");
        setConnectionStatus("לא מחובר");
      });
    }
  };

  const checkTokenStatus = async () => {
    if (!tokens || tokens.length === 0) {
      addDebugLog("No tokens to check");
      return;
    }

    addDebugLog("Checking token validity...");
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("check-facebook-tokens");

      if (error) {
        addDebugLog(`Error checking tokens: ${error.message}`);
      } else {
        addDebugLog(`Token check completed: ${JSON.stringify(data)}`);
        if (data.results) {
          data.results.forEach((result: any) => {
            addDebugLog(`${result.page_name}: ${result.status} - ${result.message}`);
          });
        }
      }
    } catch (error) {
      addDebugLog(`Error invoking token check: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testFacebookAPI = async () => {
    if (!fbInitialized) {
      addDebugLog("Cannot test - Facebook SDK not initialized");
      return;
    }

    addDebugLog("Testing Facebook API connection...");
    try {
      const response = await new Promise((resolve, reject) => {
        window.FB.getLoginStatus((response: any) => {
          addDebugLog(`Login status: ${JSON.stringify(response)}`);
          resolve(response);
        });
      });
      addDebugLog("Facebook API test completed");
    } catch (error) {
      addDebugLog(`Facebook API test failed: ${error}`);
    }
  };

  const fetchAllLeadsFromFacebook = async () => {
    if (!tokens || tokens.length === 0) {
      addDebugLog("No stored Facebook page tokens found");
      setMessage("אין טוקנים זמינים לשליפת לידים");
      return;
    }

    setLoading(true);
    addDebugLog("Fetching all leads from Facebook...");
    setMessage("טוען לידים מפייסבוק...");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");
      const userId = user.id;

      for (const token of tokens) {
        const { page_id, page_name, access_token } = token;
        addDebugLog(`Processing page: ${page_name} (${page_id})`);

        const formsResponse = await fbApi<{ data: Array<{ id: string }> }>(`/${page_id}/leadgen_forms`, "GET", {
          access_token,
        });
        const forms = formsResponse.data || [];
        addDebugLog(`Found ${forms.length} lead forms for ${page_name}`);

        for (const form of forms) {
          const leadsResponse = await fbApi<{ data: any[] }>(`/${form.id}/leads`, "GET", { access_token });
          const leads = leadsResponse.data || [];
          addDebugLog(`Fetched ${leads.length} leads for form ${form.id}`);

          for (const lead of leads) {
            const leadId = lead.id;
            const { error } = await supabase.rpc("save_facebook_lead" as any, {
              p_user_id: userId,
              p_page_id: page_id,
              p_lead_id: lead.id,
              p_lead_data: lead,
              p_created_at: new Date(lead.created_time),
            });
            if (error) {
              addDebugLog(`ERROR saving lead ${leadId}: ${error.message}`);
            } else {
              addDebugLog(`Saved lead ${leadId} from page ${page_name}`);
            }
          }
        }
      }

      setMessage("לידים נשלפו ונשמרו בהצלחה!");
      addDebugLog("All Facebook leads fetched and saved successfully");
    } catch (err: any) {
      addDebugLog(`ERROR fetching leads: ${err.message || err}`);
      setMessage(`שגיאה בשליפת לידים: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 text-right space-y-4">
      {/* Status Display */}
      <div className="bg-muted/50 p-3 rounded-lg">
        <div className="text-sm font-medium">סטטוס חיבור: {connectionStatus}</div>
        {tokens && tokens.length > 0 && (
          <div className="text-xs text-muted-foreground mt-1">
            דפים מחוברים: {tokens.map((t) => t.page_name).join(", ")}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 flex-wrap">
        <button className="btn-primary" onClick={loginAndSubscribe} disabled={!fbInitialized || loading}>
          {loading ? "טוען..." : "התחבר לפייסבוק והרשם לכל הדפים"}
        </button>

        <button
          className="btn-secondary"
          onClick={fetchAllLeadsFromFacebook}
          disabled={!tokens || tokens.length === 0 || loading}
        >
          רענון לידים מפייסבוק
        </button>

        <button className="btn-secondary" onClick={resetConnection} disabled={loading}>
          איפוס חיבור
        </button>

        <button
          className="btn-secondary"
          onClick={checkTokenStatus}
          disabled={!tokens || tokens.length === 0 || loading}
        >
          בדיקת תקפות טוקנים
        </button>

        <button className="btn-secondary" onClick={testFacebookAPI} disabled={!fbInitialized || loading}>
          בדיקת API
        </button>
      </div>

      {/* Messages */}
      {message && <div className="p-3 bg-accent/20 rounded-lg text-sm">{message}</div>}

      {/* Debug Info */}
      {debugInfo.length > 0 && (
        <details className="bg-muted/30 p-3 rounded-lg">
          <summary className="cursor-pointer text-sm font-medium">מידע דיבוג ({debugInfo.length} הודעות)</summary>
          <div className="mt-2 space-y-1 text-xs font-mono max-h-60 overflow-y-auto">
            {debugInfo.map((log, i) => (
              <div key={i} className={`${log.includes("ERROR") ? "text-destructive" : "text-muted-foreground"}`}>
                {log}
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

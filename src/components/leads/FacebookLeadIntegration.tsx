import { useState, useEffect } from "react";

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

  useEffect(() => {
    if (window.FB) {
      setFbInitialized(true);
      return;
    }

    window.fbAsyncInit = () => {
      window.FB.init({
        appId: "2106125989900776",
        cookie: true,
        xfbml: false,
        version: "v17.0",
      });
      setFbInitialized(true);
    };

    if (!document.getElementById("facebook-jssdk")) {
      const js = document.createElement("script");
      js.id = "facebook-jssdk";
      js.src = "https://connect.facebook.net/he_IL/sdk.js";
      document.head.appendChild(js);
    }
  }, []);

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

  async function subscribePageToWebhook(pageId: string, pageAccessToken: string) {
    return fbApi(/${pageId}/subscribed_apps, "POST", {
      access_token: pageAccessToken,
      subscribed_fields: "leadgen",
    });
  }

  const loginAndSubscribe = () => {
    if (!fbInitialized) return;

    setLoading(true);
    setMessage("");

    window.FB.login(function (response: any) {
      if (response.authResponse) {
        (async () => {
          try {
            const pagesResponse = await fbApi<{ data: Array<{ id: string; access_token: string; name: string }> }>("/me/accounts");
            console.log("Pages response:", pagesResponse);

            for (const page of pagesResponse.data) {
              await subscribePageToWebhook(page.id, page.access_token);
              console.log(Subscribed page ${page.name} (${page.id}));

              const leadFormsResponse = await fbApi<{ data: Array<{ id: string }> }>(/${page.id}/leadgen_forms, "GET", {
                access_token: page.access_token,
              });
              const leadForms = leadFormsResponse.data || [];
              console.log(Found ${leadForms.length} lead forms for page ${page.name});

              for (const form of leadForms) {
                const leadsResponse = await fbApi<{ data: any[] }>(/${form.id}/leads, "GET", {
                  access_token: page.access_token,
                });
                const leads = leadsResponse.data || [];
                console.log(Fetched ${leads.length} leads for form ${form.id});

                for (const lead of leads) {
                  console.log("Lead:", lead);
                }
              }
            }

            setMessage("כל הדפים שלך נרשמו ונטענו כל הלידים בהצלחה!");
          } catch (error: any) {
            setMessage(שגיאה בקבלת דפים, הרשמה או טעינת לידים: ${error.message || error});
          } finally {
            setLoading(false);
          }
        })();
      } else {
        setMessage("המשתמש ביטל את ההתחברות או לא נתן הרשאות מלאות.");
        setLoading(false);
      }
    }, {
      scope: "public_profile,email,pages_show_list,pages_manage_metadata,leads_retrieval",
    });
  };

  return (
    <div className="p-4 text-right">
      <button
        className="btn-primary"
        onClick={loginAndSubscribe}
        disabled={!fbInitialized || loading}
      >
        {loading ? "טוען..." : "התחבר לפייסבוק והרשם לכל הדפים"}
      </button>
      {message && <p className="mt-2">{message}</p>}
    </div>
  );
}
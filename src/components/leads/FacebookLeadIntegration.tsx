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

  async function subscribePageToWebhook(pageId: string, pageAccessToken: string) {
    return new Promise((resolve, reject) => {
      window.FB.api(
        `/${pageId}/subscribed_apps`,
        "POST",
        { access_token: pageAccessToken, subscribed_fields: "leadgen" },
        function (response: any) {
          if (!response || response.error) {
            reject(response?.error || "Unknown error");
          } else {
            resolve(response);
          }
        }
      );
    });
  }

  const loginAndSubscribe = () => {
  if (!fbInitialized) return;

  setLoading(true);
  setMessage("");

  window.FB.login(async function (response) {
    if (response.authResponse) {
      try {
        // Get pages the user manages
        const pagesResponse = await new Promise((resolve, reject) => {
          window.FB.api("/me/accounts", function (res) {
            if (res.error) reject(res.error);
            else resolve(res);
          });
        });

        for (const page of (pagesResponse as any).data) {
          // Subscribe page to webhook
          await new Promise((resolve, reject) => {
            window.FB.api(
              `/${page.id}/subscribed_apps`,
              "POST",
              { access_token: page.access_token, subscribed_fields: "leadgen" },
              function (subRes) {
                if (!subRes || subRes.error) reject(subRes?.error || "Unknown error");
                else resolve(subRes);
              }
            );
          });

          console.log(`Subscribed page ${page.name} (${page.id})`);

          // Fetch lead forms for page
          const leadFormsResponse = await new Promise((resolve, reject) => {
            window.FB.api(
              `/${page.id}/leadgen_forms`,
              "GET",
              { access_token: page.access_token },
              function (formsRes) {
                if (!formsRes || formsRes.error) reject(formsRes?.error || "Failed to fetch lead forms");
                else resolve(formsRes);
              }
            );
          });

          const leadForms = (leadFormsResponse as any).data || [];
          console.log(`Found ${leadForms.length} lead forms for page ${page.name}`);

          // For each form, fetch leads
          for (const form of leadForms) {
            const leadsResponse = await new Promise((resolve, reject) => {
              window.FB.api(
                `/${form.id}/leads`,
                "GET",
                { access_token: page.access_token },
                function (leadsRes) {
                  if (!leadsRes || leadsRes.error) reject(leadsRes?.error || "Failed to fetch leads");
                  else resolve(leadsRes);
                }
              );
            });

            const leads = (leadsResponse as any).data || [];
            console.log(`Fetched ${leads.length} leads for form ${form.id}`);

            // Process leads here or send to backend
            for (const lead of leads) {
              console.log("Lead:", lead);
            }
          }
        }

        setMessage("כל הדפים שלך נרשמו ונטענו כל הלידים בהצלחה!");
      } catch (error: any) {
        setMessage(`שגיאה בקבלת דפים, הרשמה או טעינת לידים: ${error.message || error}`);
      } finally {
        setLoading(false);
      }
    } else {
      setMessage("המשתמש ביטל את ההתחברות או לא נתן הרשאות מלאות.");
      setLoading(false);
    }
  }, {
    scope: 'public_profile,email,pages_show_list,pages_manage_metadata,leads_retrieval'
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

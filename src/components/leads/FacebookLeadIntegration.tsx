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
    window.fbAsyncInit = function () {
      window.FB.init({
        appId: "101137678772993",
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

  function subscribePageToWebhook(pageId: string, pageAccessToken: string) {
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

    window.FB.login(function (response: any) {
      (async () => {
        if (response.authResponse) {
          window.FB.api("/me/accounts", function (pagesResponse: any) {
            (async () => {
              if (pagesResponse.error) {
                setMessage(`שגיאה בקבלת דפים: ${JSON.stringify(pagesResponse.error)}`);
                setLoading(false);
                return;
              }

              try {
                for (const page of pagesResponse.data) {
                  await subscribePageToWebhook(page.id, page.access_token);
                  console.log(`Subscribed page ${page.name} (${page.id})`);
                }
                setMessage("כל הדפים שלך נרשמו לקבלת לידים בהצלחה!");
              } catch (error: any) {
                setMessage(`שגיאה בהרשמת דף: ${error.message || error}`);
              } finally {
                setLoading(false);
              }
            })();
          });
        } else {
          setMessage("המשתמש ביטל את ההתחברות או לא נתן הרשאות מלאות.");
          setLoading(false);
        }
      })();
    }, { scope: "pages_manage_metadata,pages_show_list,leads_retrieval" });
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

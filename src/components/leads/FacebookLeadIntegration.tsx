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

    window.FB.login(function (response) {
      (async () => {
        if (response.authResponse) {
          try {
            const pagesResponse = await new Promise((resolve, reject) => {
              window.FB.api("/me/accounts", function (res) {
                if (res.error) reject(res.error);
                else resolve(res);
              });
            });

            for (const page of (pagesResponse as any).data) {
              await subscribePageToWebhook(page.id, page.access_token);
              console.log(`Subscribed page ${page.name} (${page.id})`);
            }
            setMessage("כל הדפים שלך נרשמו לקבלת לידים בהצלחה!");
          } catch (error: any) {
            setMessage(`שגיאה בקבלת דפים או בהרשמת דף: ${error.message || error}`);
          } finally {
            setLoading(false);
          }
        } else {
          setMessage("המשתמש ביטל את ההתחברות או לא נתן הרשאות מלאות.");
          setLoading(false);
        }
      })();
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

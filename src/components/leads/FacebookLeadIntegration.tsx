
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

// Extend the Window interface to include Facebook SDK
declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

// Helper function to subscribe a page to webhook
const subscribePageToWebhook = async (pageId: string, pageAccessToken: string) => {
  const response = await fetch(`https://graph.facebook.com/${pageId}/subscribed_apps`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      subscribed_fields: 'leadgen',
      access_token: pageAccessToken,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to subscribe page: ${JSON.stringify(error)}`);
  }

  return response.json();
};

export function FacebookLeadIntegration() {
  const [fbInitialized, setFbInitialized] = useState(false);

  useEffect(() => {
    window.fbAsyncInit = function () {
      window.FB.init({
        appId: "YOUR_APP_ID",
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

  const loginAndSubscribe = () => {
    if (!fbInitialized) return;

    window.FB.login(async function (response: any) {
      if (response.authResponse) {
        window.FB.api("/me/accounts", async function (pagesResponse: any) {
          if (pagesResponse.error) {
            alert("Error fetching pages: " + JSON.stringify(pagesResponse.error));
            return;
          }

          for (const page of pagesResponse.data) {
            try {
              await subscribePageToWebhook(page.id, page.access_token);
              console.log(`Subscribed page ${page.name} (${page.id}) successfully`);
              // you have save page.access_token in backend here
            } catch (error) {
              console.error(`Failed to subscribe page ${page.id}`, error);
            }
          }

          alert("כל הדפים שלך נרשמו לקבלת לידים בהצלחה!");
        });
      } else {
        alert("המשתמש ביטל את ההתחברות או לא נתן הרשאות מלאות.");
      }
    }, { scope: "pages_manage_metadata,pages_show_list,leads_retrieval" });
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>אינטגרציה עם לידים מפייסבוק</CardTitle>
        <CardDescription>
          התחבר לפייסבוק והירשם לקבלת לידים אוטומטית מכל הדפים שלך
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          לחץ על הכפתור למטה כדי להתחבר לפייסבוק ולהירשם אוטומטית לקבלת לידים מכל הדפים שלך.
        </p>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={loginAndSubscribe} 
          disabled={!fbInitialized}
          className="w-full"
        >
          {fbInitialized ? "התחבר לפייסבוק והרשם לכל הדפים" : "טוען Facebook SDK..."}
        </Button>
      </CardFooter>
    </Card>
  );
}

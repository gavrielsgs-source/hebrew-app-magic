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
      js.src = "https://connect.facebook.net/he_IL/sdk.js"; // Hebrew locale
      document.head.appendChild(js);
    }
  }, []);

  const loginAndSubscribe = () => {
    if (!fbInitialized) return;

    window.FB.login(async function (response) {
      if (response.authResponse) {
        window.FB.api("/me/accounts", async function (pagesResponse) {
          if (pagesResponse.error) {
            alert("Error fetching pages: " + JSON.stringify(pagesResponse.error));
            return;
          }

          for (const page of pagesResponse.data) {
            try {
              await subscribePageToWebhook(page.id, page.access_token);
              console.log(`Subscribed page ${page.name} (${page.id}) successfully`);
              // TODO: save page.access_token in backend here
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
    <button onClick={loginAndSubscribe} className="btn-primary">
      התחבר לפייסבוק והרשם לכל הדפים
    </button>
  );
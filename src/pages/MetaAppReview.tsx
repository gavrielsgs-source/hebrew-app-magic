import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, XCircle, AlertTriangle, Loader2, Instagram, Facebook, Globe, RefreshCw, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

interface PageInfo {
  id: string;
  name: string;
  access_token: string;
  instagram_business_account?: { id: string } | null;
}

interface LeadgenSubscription {
  subscribed: boolean;
  fields: string[];
}

interface AdAccountInfo {
  id: string;
  name: string;
  account_id: string;
  currency?: string;
}

interface AdInfo {
  id: string;
  name: string;
  status?: string;
  campaign_id?: string;
}

const META_APP_ID = "2106125989900776";
const GRAPH_VERSION = "v21.0";
const SCOPES = "public_profile,email,pages_show_list,pages_manage_metadata,leads_retrieval,business_management,pages_manage_ads,ads_read,instagram_basic";

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

export default function MetaAppReview() {
  const { toast } = useToast();
  const [sdkReady, setSdkReady] = useState(false);
  const [loading, setLoading] = useState("");
  const [logs, setLogs] = useState<string[]>([]);

  // Step 1: Connection
  const [connected, setConnected] = useState(false);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [userName, setUserName] = useState("");

  // Step 2: Pages
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [selectedPage, setSelectedPage] = useState<PageInfo | null>(null);

  // Step 3: Instagram
  const [igAccountId, setIgAccountId] = useState<string | null>(null);
  const [igChecked, setIgChecked] = useState(false);

  // Step 4: Leadgen subscription
  const [leadgenSub, setLeadgenSub] = useState<LeadgenSubscription | null>(null);

  // Step 5: Ads read
  const [adAccounts, setAdAccounts] = useState<AdAccountInfo[]>([]);
  const [sampleAd, setSampleAd] = useState<AdInfo | null>(null);
  const [adsError, setAdsError] = useState<string | null>(null);

  // Step 6: Lead attribution
  const [storedLeads, setStoredLeads] = useState<any[]>([]);

  const log = useCallback((msg: string) => {
    const ts = new Date().toLocaleTimeString();
    setLogs(prev => [`[${ts}] ${msg}`, ...prev]);
  }, []);

  // Initialize Facebook SDK
  useEffect(() => {
    if (window.FB) {
      setSdkReady(true);
      return;
    }
    window.fbAsyncInit = () => {
      window.FB.init({ appId: META_APP_ID, cookie: true, xfbml: false, version: GRAPH_VERSION });
      setSdkReady(true);
    };
    if (!document.getElementById("facebook-jssdk")) {
      const js = document.createElement("script");
      js.id = "facebook-jssdk";
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      document.head.appendChild(js);
    }
  }, []);

  // ─── Step 1: Connect Meta ───
  const connectMeta = () => {
    setLoading("connect");
    log("Starting Meta login with scopes: " + SCOPES);
    window.FB.login(async (response: any) => {
      if (response.authResponse) {
        const token = response.authResponse.accessToken;
        log("✅ Login successful, got short-lived token");
        
        // Exchange for long-lived token
        try {
          const { data: { session } } = await supabase.auth.getSession();
          const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/exchange-for-long-lived-token`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
              Authorization: `Bearer ${session?.access_token}`,
            },
            body: JSON.stringify({ shortLivedToken: token }),
          });
          const data = await res.json();
          const longToken = data.access_token;
          log("✅ Exchanged for long-lived token");
          setUserToken(longToken);

          // Get user name
          const me = await fbApi<{ name: string }>("/me", "GET", { access_token: longToken });
          setUserName(me.name);
          setConnected(true);
          log(`✅ Connected as: ${me.name}`);
          toast({ title: "חיבור הצליח", description: `מחובר בתור ${me.name}` });

          // Fetch pages immediately
          fetchPages(longToken);
        } catch (err: any) {
          log(`❌ Token exchange failed: ${err.message}`);
          toast({ title: "שגיאה", description: err.message, variant: "destructive" });
        }
      } else {
        log("❌ Login cancelled or failed");
        toast({ title: "חיבור נכשל", description: "המשתמש ביטל את ההתחברות", variant: "destructive" });
      }
      setLoading("");
    }, { scope: SCOPES });
  };

  // ─── Step 2: Fetch Pages ───
  const fetchPages = async (token: string) => {
    setLoading("pages");
    log("Fetching pages...");
    try {
      const res = await fbApi<{ data: PageInfo[] }>("/me/accounts", "GET", { access_token: token });
      setPages(res.data || []);
      log(`✅ Found ${res.data?.length || 0} pages`);
    } catch (err: any) {
      log(`❌ Failed to fetch pages: ${err.message}`);
    }
    setLoading("");
  };

  const selectPage = async (page: PageInfo) => {
    setLoading("select");
    log(`Selecting page: ${page.name} (${page.id})`);
    
    // Exchange page token for long-lived version
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/exchange-for-long-lived-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ shortLivedToken: page.access_token }),
      });
      const data = await res.json();
      const longPageToken = data.access_token;
      
      const pageWithLongToken = { ...page, access_token: longPageToken };
      setSelectedPage(pageWithLongToken);
      log(`✅ Page selected and token exchanged`);

      // Save to DB
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.rpc("save_facebook_token" as any, {
          p_access_token: longPageToken,
          p_page_id: page.id,
          p_page_name: page.name,
          p_user_id: user.id,
          p_expires_at: new Date("2999-12-31T23:59:59Z"),
        });
        log(`✅ Token saved to database`);
      }

      // Auto-run checks
      checkInstagram(page.id, longPageToken);
      checkLeadgenSubscription(page.id, longPageToken);
    } catch (err: any) {
      log(`❌ Page selection failed: ${err.message}`);
    }
    setLoading("");
  };

  // ─── Step 3: Instagram Check ───
  const checkInstagram = async (pageId: string, token: string) => {
    setLoading("instagram");
    log(`Checking Instagram Business Account for page ${pageId}...`);
    try {
      const res = await fbApi<{ id: string; name: string; instagram_business_account?: { id: string } }>(
        `/${pageId}`, "GET", { fields: "id,name,instagram_business_account", access_token: token }
      );
      if (res.instagram_business_account) {
        setIgAccountId(res.instagram_business_account.id);
        log(`✅ Instagram Business Account found: ${res.instagram_business_account.id}`);
      } else {
        setIgAccountId(null);
        log("⚠️ No Instagram Business Account linked to this page");
      }
      setIgChecked(true);
    } catch (err: any) {
      log(`❌ Instagram check failed: ${err.message}`);
      setIgAccountId(null);
      setIgChecked(true);
    }
    setLoading("");
  };

  // ─── Step 4: Leadgen Subscription ───
  const checkLeadgenSubscription = async (pageId: string, token: string) => {
    setLoading("leadgen");
    log(`Checking leadgen webhook subscription for page ${pageId}...`);
    try {
      const res = await fbApi<{ data: Array<{ subscribed_fields: string[] }> }>(
        `/${pageId}/subscribed_apps`, "GET", { access_token: token }
      );
      const myApp = res.data?.find((app: any) => true); // our app entry
      if (myApp && myApp.subscribed_fields?.includes("leadgen")) {
        setLeadgenSub({ subscribed: true, fields: myApp.subscribed_fields });
        log(`✅ Page subscribed to leadgen webhook`);
      } else {
        setLeadgenSub({ subscribed: false, fields: myApp?.subscribed_fields || [] });
        log("⚠️ Page NOT subscribed to leadgen");
      }
    } catch (err: any) {
      log(`❌ Leadgen check failed: ${err.message}`);
      setLeadgenSub({ subscribed: false, fields: [] });
    }
    setLoading("");
  };

  const subscribeToLeadgen = async () => {
    if (!selectedPage) return;
    setLoading("subscribe");
    log(`Subscribing page ${selectedPage.name} to leadgen...`);
    try {
      await fbApi(`/${selectedPage.id}/subscribed_apps`, "POST", {
        access_token: selectedPage.access_token,
        subscribed_fields: "leadgen",
      });
      log(`✅ Successfully subscribed to leadgen`);
      setLeadgenSub({ subscribed: true, fields: ["leadgen"] });
      toast({ title: "הצלחה", description: "הדף נרשם לקבלת לידים" });
    } catch (err: any) {
      log(`❌ Subscribe failed: ${err.message}`);
      toast({ title: "שגיאה", description: err.message, variant: "destructive" });
    }
    setLoading("");
  };

  // ─── Step 5: Ads Read Demo ───
  const testAdsRead = async () => {
    if (!userToken) return;
    setLoading("ads");
    setAdsError(null);
    setSampleAd(null);
    setAdAccounts([]);
    log("Testing ads_read permission...");
    try {
      // Fetch ad accounts
      const accts = await fbApi<{ data: AdAccountInfo[] }>("/me/adaccounts", "GET", {
        access_token: userToken,
        fields: "id,name,account_id,currency",
        limit: 5,
      });
      setAdAccounts(accts.data || []);
      log(`✅ Found ${accts.data?.length || 0} ad accounts`);

      // Try to fetch one ad from the first account
      if (accts.data && accts.data.length > 0) {
        const acctId = accts.data[0].id;
        log(`Fetching sample ad from account ${acctId}...`);
        try {
          const ads = await fbApi<{ data: AdInfo[] }>(`/${acctId}/ads`, "GET", {
            access_token: userToken,
            fields: "id,name,status",
            limit: 1,
          });
          if (ads.data && ads.data.length > 0) {
            setSampleAd(ads.data[0]);
            log(`✅ Sample ad: ${ads.data[0].name} (${ads.data[0].id})`);
          } else {
            log("ℹ️ No ads found in this account");
          }
        } catch (adErr: any) {
          log(`⚠️ Could not fetch ads: ${adErr.message}`);
        }
      }
    } catch (err: any) {
      setAdsError(err.message || JSON.stringify(err));
      log(`❌ ads_read test failed: ${err.message || JSON.stringify(err)}`);
    }
    setLoading("");
  };

  // ─── Step 6: Lead Attribution ───
  const loadStoredLeads = async () => {
    setLoading("leads");
    log("Loading stored leads with attribution data...");
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from("facebook_leads")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      setStoredLeads(data || []);
      log(`✅ Loaded ${data?.length || 0} leads`);
    } catch (err: any) {
      log(`❌ Failed to load leads: ${err.message}`);
    }
    setLoading("");
  };

  const StatusIcon = ({ ok }: { ok: boolean | null }) => {
    if (ok === null) return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    return ok ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />;
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6" dir="ltr">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Meta App Review — Demo Flow</h1>
        <p className="text-muted-foreground">
          Complete end-to-end demonstration for <code>instagram_basic</code> + <code>ads_read</code> permissions
        </p>
        <div className="flex justify-center gap-2">
          <Badge variant="outline">instagram_basic</Badge>
          <Badge variant="outline">ads_read</Badge>
          <Badge variant="outline">leads_retrieval</Badge>
          <Badge variant="outline">pages_manage_metadata</Badge>
        </div>
      </div>

      <Separator />

      {/* ─── Step 1: Connect Meta ─── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Step 1: Connect Meta Account
            {connected && <StatusIcon ok={true} />}
          </CardTitle>
          <CardDescription>Login with Facebook and grant required permissions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-muted-foreground">
            <strong>Requested scopes:</strong> {SCOPES.split(",").join(", ")}
          </div>
          {!connected ? (
            <Button onClick={connectMeta} disabled={!sdkReady || loading === "connect"} size="lg">
              {loading === "connect" ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Facebook className="mr-2 h-4 w-4" />}
              Connect Meta Account
            </Button>
          ) : (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Connected</AlertTitle>
              <AlertDescription>Logged in as <strong>{userName}</strong></AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* ─── Step 2: Page Selection ─── */}
      {connected && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Facebook className="h-5 w-5" />
              Step 2: Select Facebook Page
              {selectedPage && <StatusIcon ok={true} />}
            </CardTitle>
            <CardDescription>Choose which Page to use for lead syncing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {pages.length === 0 && loading !== "pages" && (
              <p className="text-sm text-muted-foreground">No pages found. Make sure you granted page access.</p>
            )}
            {loading === "pages" && <Loader2 className="animate-spin h-5 w-5" />}
            <div className="grid gap-2">
              {pages.map(page => (
                <Button
                  key={page.id}
                  variant={selectedPage?.id === page.id ? "default" : "outline"}
                  className="justify-start"
                  onClick={() => selectPage(page)}
                  disabled={loading === "select"}
                >
                  {page.name} <span className="text-xs text-muted-foreground ml-2">({page.id})</span>
                </Button>
              ))}
            </div>
            {selectedPage && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Active Page</AlertTitle>
                <AlertDescription>
                  <strong>{selectedPage.name}</strong> — ID: {selectedPage.id}<br />
                  Token saved to database ✓
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* ─── Step 3: Instagram Business Account ─── */}
      {selectedPage && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Instagram className="h-5 w-5" />
              Step 3: Instagram Business Account Check
              {igChecked && <StatusIcon ok={!!igAccountId} />}
            </CardTitle>
            <CardDescription>
              Uses <code>instagram_basic</code> to read the linked Instagram Business Account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm">
              <strong>API call:</strong> <code>GET /{selectedPage.id}?fields=id,name,instagram_business_account</code>
            </div>
            {loading === "instagram" && <Loader2 className="animate-spin h-5 w-5" />}
            {igChecked && (
              igAccountId ? (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Instagram Business Account Linked</AlertTitle>
                  <AlertDescription>
                    Instagram Business Account ID: <strong>{igAccountId}</strong>
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>No Instagram Business Account</AlertTitle>
                  <AlertDescription>
                    This Page does not have a linked Instagram Business Account.
                    Link one in Facebook Page Settings → Instagram.
                  </AlertDescription>
                </Alert>
              )
            )}
            <Button variant="outline" size="sm" onClick={() => checkInstagram(selectedPage.id, selectedPage.access_token)}>
              <RefreshCw className="mr-2 h-3 w-3" /> Re-check
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ─── Step 4: Leadgen Webhook Subscription ─── */}
      {selectedPage && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📨 Step 4: Leadgen Webhook Subscription
              {leadgenSub && <StatusIcon ok={leadgenSub.subscribed} />}
            </CardTitle>
            <CardDescription>Check and manage leadgen webhook subscription for this Page</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm">
              <strong>API call:</strong> <code>GET /{selectedPage.id}/subscribed_apps</code>
            </div>
            {loading === "leadgen" && <Loader2 className="animate-spin h-5 w-5" />}
            {leadgenSub && (
              leadgenSub.subscribed ? (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Subscribed to Leadgen</AlertTitle>
                  <AlertDescription>
                    Subscribed fields: {leadgenSub.fields.join(", ")}
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-2">
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Not Subscribed</AlertTitle>
                    <AlertDescription>This Page is not subscribed to receive lead notifications.</AlertDescription>
                  </Alert>
                  <Button onClick={subscribeToLeadgen} disabled={loading === "subscribe"}>
                    {loading === "subscribe" ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                    Subscribe to Leadgen
                  </Button>
                </div>
              )
            )}
            <Button variant="outline" size="sm" onClick={() => checkLeadgenSubscription(selectedPage.id, selectedPage.access_token)}>
              <RefreshCw className="mr-2 h-3 w-3" /> Re-check
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ─── Step 5: Ads Read Test ─── */}
      {connected && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📊 Step 5: Read-Only Ad Metadata (ads_read)
              {adAccounts.length > 0 && <StatusIcon ok={true} />}
              {adsError && <StatusIcon ok={false} />}
            </CardTitle>
            <CardDescription>
              Demonstrates read-only access to ad accounts and ads for lead source attribution.
              This data is used to determine whether a lead came from Facebook or Instagram.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm">
              <strong>API calls:</strong><br />
              <code>GET /me/adaccounts?fields=id,name,account_id,currency</code><br />
              <code>GET /{'<acct_id>'}/ads?fields=id,name,status&limit=1</code>
            </div>
            <Button onClick={testAdsRead} disabled={loading === "ads"}>
              {loading === "ads" ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
              Test ads_read
            </Button>
            {adsError && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>ads_read Failed</AlertTitle>
                <AlertDescription className="font-mono text-xs break-all">{adsError}</AlertDescription>
              </Alert>
            )}
            {adAccounts.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Ad Accounts ({adAccounts.length}):</h4>
                <div className="bg-muted rounded-md p-3 text-xs font-mono space-y-1">
                  {adAccounts.map(a => (
                    <div key={a.id}>{a.name} — {a.id} ({a.currency})</div>
                  ))}
                </div>
              </div>
            )}
            {sampleAd && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Sample Ad (read-only):</h4>
                <div className="bg-muted rounded-md p-3 text-xs font-mono">
                  Name: {sampleAd.name}<br />
                  ID: {sampleAd.id}<br />
                  Status: {sampleAd.status}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ─── Step 6: Lead Attribution ─── */}
      {selectedPage && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🎯 Step 6: Lead Source Attribution
              {storedLeads.length > 0 && <StatusIcon ok={true} />}
            </CardTitle>
            <CardDescription>
              Shows how leads are attributed to Facebook, Instagram, or Meta (unknown) using ad metadata.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm bg-muted/50 rounded-md p-3 space-y-1">
              <p><strong>Attribution flow:</strong></p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Lead received from Meta leadgen webhook</li>
                <li>Lead details retrieved via Graph API using <code>leads_retrieval</code></li>
                <li>Ad metadata lookup using <code>ads_read</code> — checks for <code>instagram_actor_id</code></li>
                <li>If Instagram markers found → source = <strong>Instagram</strong></li>
                <li>If no Instagram markers and ad exists → source = <strong>Facebook</strong></li>
                <li>If detection fails → source = <strong>Meta</strong> (never falsely attributed)</li>
              </ol>
            </div>
            <Button onClick={loadStoredLeads} disabled={loading === "leads"} variant="outline">
              {loading === "leads" ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
              Load Recent Leads
            </Button>
            {storedLeads.length > 0 ? (
              <div className="space-y-2">
                {storedLeads.map((lead, i) => {
                  const ld = lead.lead_data as any;
                  const platform = ld?.platform || "Meta";
                  const method = ld?.platform_detection_method || "unknown";
                  const confidence = ld?.platform_detection_confidence || "none";
                  const name = ld?.field_data?.find((f: any) => f.name === "full_name" || f.name === "name")?.values?.[0] || "Unknown";
                  return (
                    <div key={lead.id} className="bg-muted rounded-md p-3 text-xs font-mono space-y-1">
                      <div className="flex items-center gap-2">
                        <strong>Lead #{i + 1}:</strong> {name}
                        <Badge variant={platform === "Instagram" ? "default" : platform === "Facebook" ? "secondary" : "outline"}>
                          {platform === "Instagram" && <Instagram className="h-3 w-3 mr-1" />}
                          {platform === "Facebook" && <Facebook className="h-3 w-3 mr-1" />}
                          {platform}
                        </Badge>
                      </div>
                      <div>Lead ID: {lead.lead_id}</div>
                      <div>Page ID: {lead.page_id}</div>
                      <div>Detection: {method} (confidence: {confidence})</div>
                      <div>Created: {new Date(lead.created_at).toLocaleString()}</div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-muted rounded-md p-3 text-xs space-y-1">
                <p className="font-medium">Demo Attribution Example:</p>
                <div className="font-mono">
                  Lead: "John Doe" → ad_id: 12345 → instagram_actor_id found → <Badge>Instagram</Badge><br />
                  Lead: "Jane Doe" → ad_id: 67890 → no instagram markers → <Badge variant="secondary">Facebook</Badge><br />
                  Lead: "Test User" → ad_id: null → detection failed → <Badge variant="outline">Meta</Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ─── Step 7: Screencast Guide ─── */}
      <Card>
        <CardHeader>
          <CardTitle>🎬 Step 7: Screencast Recording Guide</CardTitle>
          <CardDescription>Follow these steps when recording for Meta App Review</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li><strong>Connect Meta</strong> — Click "Connect Meta Account", complete the login dialog, show granted permissions</li>
            <li><strong>Select Page</strong> — Choose your Facebook Page from the list, show it saved</li>
            <li><strong>Instagram Check</strong> — Show the linked Instagram Business Account ID (proves <code>instagram_basic</code> works)</li>
            <li><strong>Leadgen Subscription</strong> — Show the Page is subscribed to receive leads</li>
            <li><strong>Ads Read</strong> — Click "Test ads_read", show ad accounts and sample ad (proves <code>ads_read</code> works)</li>
            <li><strong>Lead Attribution</strong> — Load recent leads, show how platform detection works (Facebook / Instagram / Meta)</li>
            <li><strong>CRM View</strong> — Navigate to the Leads page, show leads with correct source labels</li>
          </ol>
        </CardContent>
      </Card>

      {/* ─── Debug Log ─── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Debug Log ({logs.length} entries)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-48 overflow-y-auto bg-muted rounded-md p-3 text-xs font-mono space-y-0.5">
            {logs.length === 0 ? (
              <span className="text-muted-foreground">No activity yet</span>
            ) : (
              logs.map((l, i) => (
                <div key={i} className={l.includes("❌") ? "text-red-500" : l.includes("⚠️") ? "text-yellow-600" : "text-foreground"}>
                  {l}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

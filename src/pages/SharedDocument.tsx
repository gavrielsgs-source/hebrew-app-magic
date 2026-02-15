import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Download, FileText, AlertTriangle, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DocumentMeta {
  title: string;
  documentNumber: string;
  type: string;
  date: string;
}

export default function SharedDocument() {
  const { shareId } = useParams<{ shareId: string }>();
  const [loading, setLoading] = useState(true);
  const [expired, setExpired] = useState(false);
  const [error, setError] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [meta, setMeta] = useState<DocumentMeta | null>(null);

  useEffect(() => {
    if (!shareId) return;
    fetchDocument("view");
  }, [shareId]);

  const fetchDocument = async (action: "view" | "download") => {
    try {
      if (action === "view") setLoading(true);

      const baseUrl = `https://zjmkdmmnajzevoupgfhg.supabase.co/functions/v1/get-shared-document`;
      const res = await fetch(
        `${baseUrl}?shareId=${shareId}&action=${action}`,
        {
          headers: {
            apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqbWtkbW1uYWp6ZXZvdXBnZmhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2OTY1NjEsImV4cCI6MjA2MDI3MjU2MX0.b-Vf2q8nQ7mbhehpA_SJ27gpvu7KgWCV9tNxUKsWRa4",
          },
        }
      );

      if (res.status === 410) {
        setExpired(true);
        setLoading(false);
        return null;
      }

      if (!res.ok) {
        setError(true);
        setLoading(false);
        return null;
      }

      const result = await res.json();
      setPdfUrl(result.signedUrl);
      if (result.document) setMeta(result.document);
      setLoading(false);
      return result.signedUrl;
    } catch (err) {
      console.error("Error fetching shared document:", err);
      setError(true);
      setLoading(false);
      return null;
    }
  };

  const handleDownload = async () => {
    const url = await fetchDocument("download");
    if (url) {
      const a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      a.download = meta?.title ? `${meta.title}.pdf` : "document.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600 text-lg">טוען מסמך...</p>
        </div>
      </div>
    );
  }

  if (expired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-orange-50" dir="rtl">
        <div className="text-center max-w-md mx-auto p-8">
          <AlertTriangle className="h-16 w-16 text-orange-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-800 mb-2">הקישור פג תוקף</h1>
          <p className="text-slate-600">
            הקישור למסמך זה אינו פעיל יותר. אנא פנה לשולח לקבלת קישור חדש.
          </p>
        </div>
      </div>
    );
  }

  if (error || !pdfUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-red-50" dir="rtl">
        <div className="text-center max-w-md mx-auto p-8">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-800 mb-2">שגיאה בטעינת המסמך</h1>
          <p className="text-slate-600">
            לא ניתן לטעון את המסמך. ייתכן שהקישור אינו תקין.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col" dir="rtl">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="font-bold text-slate-800 text-sm md:text-base">
                {meta?.title || "מסמך"}
              </h1>
              {meta?.documentNumber && (
                <p className="text-xs text-slate-500">
                  מס׳ {meta.documentNumber}
                  {meta.date && ` • ${new Date(meta.date).toLocaleDateString("he-IL")}`}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => window.open(pdfUrl, '_blank')}
              variant="outline"
              className="rounded-lg text-sm"
            >
              <ExternalLink className="h-4 w-4 ml-1" />
              פתח ב-tab חדש
            </Button>
            <Button
              onClick={handleDownload}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
            >
              <Download className="h-4 w-4 ml-1" />
              הורדה
            </Button>
          </div>
        </div>
      </header>

      {/* PDF Viewer */}
      <main className="flex-1 p-4">
        <div className="max-w-5xl mx-auto h-full">
          <iframe
            src={pdfUrl}
            className="w-full rounded-xl shadow-lg border border-slate-200 bg-white"
            style={{ minHeight: "calc(100vh - 120px)" }}
            title="Document Preview"
          />
          {/* Mobile fallback message */}
          <div className="mt-3 text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-slate-600 mb-2">
              לא רואה את המסמך? לחץ על הכפתור למטה לפתיחה ישירה
            </p>
            <Button
              onClick={() => window.open(pdfUrl, '_blank')}
              variant="outline"
              className="text-sm"
            >
              <ExternalLink className="h-4 w-4 ml-1" />
              פתח את המסמך
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/60 backdrop-blur-sm border-t border-slate-200 px-4 py-2 text-center">
        <p className="text-xs text-slate-400">CarsLead • מסמך משותף</p>
      </footer>
    </div>
  );
}

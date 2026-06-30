import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowRight, Calendar, FileText, BookOpen } from "lucide-react";
import { usePost } from "@/hooks/blog/use-posts";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Button } from "@/components/ui/button";

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading, error } = usePost(slug);

  const canonical = `https://www.carsleadapp.com/blog/${slug}`;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50" dir="rtl">
      {post && (
        <>
          <title>{`${post.title} | הבלוג של CarsLead`}</title>
          <meta name="description" content={post.meta_description || post.title} />
          <link rel="canonical" href={canonical} />
          <meta property="og:title" content={post.title} />
          <meta property="og:url" content={canonical} />
          <meta property="og:type" content="article" />
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Article",
              headline: post.title,
              description: post.meta_description,
              datePublished: post.published_at || post.created_at,
              wordCount: post.word_count,
              inLanguage: "he-IL",
              mainEntityOfPage: canonical,
            })}
          </script>
        </>
      )}

      <LandingHeader />

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-12">
        <Link to="/blog">
          <Button variant="ghost" className="mb-6 text-[#2F3C7E] hover:text-[#1F2C5E]">
            <ArrowRight className="ml-2 h-4 w-4" />
            חזרה לבלוג
          </Button>
        </Link>

        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2F3C7E]" />
          </div>
        )}

        {error && (
          <div className="text-center py-20 text-red-600">שגיאה בטעינת הכתבה.</div>
        )}

        {!isLoading && !post && !error && (
          <div className="text-center py-20">
            <BookOpen className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-4">הכתבה לא נמצאה</h2>
            <Link to="/blog">
              <Button>חזרה לבלוג</Button>
            </Link>
          </div>
        )}

        {post && (
          <article className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
            <header className="mb-8 pb-6 border-b border-gray-100">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-rubik leading-tight">
                {post.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {new Date(post.published_at || post.created_at).toLocaleDateString("he-IL", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                {post.word_count && (
                  <span className="flex items-center gap-1.5">
                    <FileText className="h-4 w-4" />
                    {post.word_count.toLocaleString("he-IL")} מילים
                  </span>
                )}
              </div>
            </header>

            <div className="prose prose-lg max-w-none prose-headings:font-rubik prose-headings:text-gray-900 prose-h1:hidden prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-xl prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-[#2F3C7E] prose-strong:text-gray-900 prose-ul:text-gray-700 prose-ol:text-gray-700">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {post.content}
              </ReactMarkdown>
            </div>
          </article>
        )}
      </main>

      <LandingFooter />
    </div>
  );
}

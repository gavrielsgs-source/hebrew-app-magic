import { BookOpen } from "lucide-react";
import { usePosts } from "@/hooks/blog/use-posts";
import { BlogCard } from "@/components/blog/BlogCard";
import { StandardPageHeader } from "@/components/common/StandardPageHeader";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { useAuth } from "@/hooks/use-auth";

export default function Blog() {
  const { user, loading } = useAuth();
  const { data: posts, isLoading, error } = usePosts();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50" dir="rtl">
      <title>הבלוג של CarsLead — תובנות וטרנדים לסוחרי רכב</title>
      <meta name="description" content="כתבות, מדריכים וטרנדים מעולם סחר הרכב בישראל — מאת CarsLead." />
      <link rel="canonical" href="https://www.carsleadapp.com/blog" />

      <LandingHeader user={user} loading={loading} />

      <StandardPageHeader
        title="הבלוג שלנו"
        subtitle="תובנות, מדריכים וטרנדים מעולם סחר הרכב בישראל"
        icon={BookOpen}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12">
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2F3C7E]" />
          </div>
        )}

        {error && (
          <div className="text-center py-20 text-red-600">
            שגיאה בטעינת הכתבות. נסה שוב מאוחר יותר.
          </div>
        )}

        {!isLoading && !error && posts && posts.length === 0 && (
          <div className="text-center py-20">
            <BookOpen className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">עדיין אין כתבות</h3>
            <p className="text-gray-500">חזרו בקרוב לתוכן חדש ומרתק.</p>
          </div>
        )}

        {posts && posts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </main>

      <LandingFooter />
    </div>
  );
}

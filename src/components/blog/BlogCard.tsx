import { Link } from "react-router-dom";
import { Calendar, FileText, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { BlogPost } from "@/hooks/blog/use-posts";

interface BlogCardProps {
  post: BlogPost;
}

export function BlogCard({ post }: BlogCardProps) {
  const date = post.published_at || post.created_at;
  const formatted = new Date(date).toLocaleDateString("he-IL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Link to={`/blog/${post.slug}`} className="group block h-full">
      <Card className="h-full flex flex-col overflow-hidden rounded-2xl border-0 shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-1 bg-white">
        <div className="h-32 bg-gradient-to-br from-[#2F3C7E] to-[#4A5A8C] relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
          <div className="absolute bottom-3 right-4 text-white/90 text-xs font-medium flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {formatted}
          </div>
        </div>
        <div className="p-6 flex flex-col flex-1" dir="rtl">
          <h2 className="text-xl font-bold text-gray-900 mb-3 font-rubik leading-snug line-clamp-2 group-hover:text-[#2F3C7E] transition-colors">
            {post.title}
          </h2>
          {post.meta_description && (
            <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4 flex-1">
              {post.meta_description}
            </p>
          )}
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
            {post.word_count ? (
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" />
                {post.word_count.toLocaleString("he-IL")} מילים
              </span>
            ) : <span />}
            <span className="text-[#2F3C7E] text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
              קרא עוד
              <ArrowLeft className="h-4 w-4" />
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}

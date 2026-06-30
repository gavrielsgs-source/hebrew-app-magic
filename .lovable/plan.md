
# תוכנית: עמוד בלוג חדש

## מטרה
להציג את הכתבות מטבלת `posts` בעמוד בלוג ציבורי, בעיצוב תואם לשאר המערכת (RTL, גוונים #2F3C7E, רובik, gradient cards).

## עמודים חדשים
1. **`/blog`** — רשימת כל הכתבות שפורסמו (`status = 'published'`), מיון לפי `published_at` יורד.
   - כותרת עמוד עם `StandardPageHeader` (אייקון BookOpen, כותרת "בלוג", תיאור).
   - רשת כרטיסים (3 עמודות בדסקטופ, 1 במובייל) עם: כותרת, `meta_description`, תאריך פרסום, מספר מילים, כפתור "קרא עוד".
   - State לטעינה ו-empty state.

2. **`/blog/:slug`** — עמוד כתבה בודדת.
   - כותרת H1, תאריך, מספר מילים, תוכן הכתבה (מ-`content`) ב-`prose` rtl.
   - כפתור חזרה לבלוג.
   - SEO: `<title>`, meta description, canonical, JSON-LD Article.

## גישה לנתונים
- הכתבות הן ציבוריות (תוכן שיווקי) → אם אין כבר policy של `anon SELECT` על `posts WHERE status='published'`, נוסיף migration קצר עם GRANT + policy. אבדוק לפני.
- שימוש ב-`@tanstack/react-query` עם `supabase.from('posts')`.

## ניווט
- הוספת קישור "בלוג" ב-Landing/Footer הציבורי (לא בסיידבר של המערכת המאובטחת, כי זה דף שיווקי חיצוני).
- רישום הראוטים ב-`src/App.tsx` כ-public routes (לצד `/`, `/about-us` וכו').

## עיצוב
- שימוש בטוקנים קיימים: `bg-gradient-to-br from-white via-gray-50 to-blue-50`, `from-[#2F3C7E] to-[#4A5A8C]`, פונט `font-rubik`.
- כרטיסי בלוג עם `shadow-lg`, `rounded-2xl`, hover scale עדין.
- תוכן כתבה ב-`prose prose-lg max-w-3xl` עם RTL.

## קבצים
- `src/pages/Blog.tsx` (חדש) — רשימה.
- `src/pages/BlogPost.tsx` (חדש) — כתבה בודדת.
- `src/components/blog/BlogCard.tsx` (חדש).
- `src/hooks/blog/use-posts.ts` + `use-post.ts` (חדשים).
- עדכון `src/App.tsx` — שני ראוטים ציבוריים חדשים.
- עדכון פוטר/לנדינג להוספת קישור "בלוג".
- במידת הצורך: migration קצר ל-RLS על `posts` לקריאה ציבורית של published בלבד.

## שאלה פתוחה
התוכן ב-`content` נראה כ-Markdown/HTML? אבדוק בזמן הבנייה ואטפל בהתאם (react-markdown אם Markdown, או `dangerouslySetInnerHTML` עם sanitize אם HTML).

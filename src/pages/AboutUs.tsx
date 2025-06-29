
export default function AboutUs() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100" dir="rtl">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-[#2F3C7E] mb-8 text-center">
            אודות CarsLead
          </h1>
          
          <div className="prose prose-lg max-w-none text-right space-y-8">
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-[#2F3C7E] mb-6">מי אנחנו</h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                אנחנו CarsLead – סטארט-אפ ישראלי שנולד מתוך מגרשי הרכב עצמם. את החברה ייסד גבריאל, סוחר רכב ותיק שראה שוב ושוב איך לידים נופלים בין הכיסאות, פגישות מתפספסות והזדמנויות מכירה הולכות לאיבוד. אחרי שנים של עבודה עם אקסלים, וואטסאפ פתוח בלי סוף ומחברות מתמלאות, הוא החליט לפתח מערכת שמדברת בשפה של הסוחרים – פשוטה, מהירה וממוקדת מכירה.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-[#2F3C7E] mb-6">המשימה שלנו</h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                להחזיר לסוחר הרכב את השליטה בזמן ובנתונים, כדי שיוכל להתמקד בדבר החשוב באמת: למכור רכבים ולבנות קשרי לקוחות לטווח ארוך.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-[#2F3C7E] mb-6">מה מייחד אותנו</h2>
              
              <div className="space-y-6">
                <div className="bg-gradient-to-l from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                  <h3 className="text-xl font-bold text-[#2F3C7E] mb-3">נוצר בידי סוחרים – עבור סוחרים</h3>
                  <p className="text-gray-700 leading-relaxed">
                    כל פיצ'ר נבדק בשטח, בעסק אמיתי, לפני שהגיע אליכם.
                  </p>
                </div>

                <div className="bg-gradient-to-l from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
                  <h3 className="text-xl font-bold text-[#2F3C7E] mb-3">"מוכרים, לא מתעסקים"</h3>
                  <p className="text-gray-700 leading-relaxed">
                    בלחיצה אחת שולחים מפרט רכב ב-WhatsApp, קובעים תזכורת, מעדכנים סטטוס ליד.
                  </p>
                </div>

                <div className="bg-gradient-to-l from-purple-50 to-violet-50 p-6 rounded-xl border border-purple-100">
                  <h3 className="text-xl font-bold text-[#2F3C7E] mb-3">Mobile-First אמיתי</h3>
                  <p className="text-gray-700 leading-relaxed">
                    כל העסק בכיס: לידים, מלאי, יומן, מסמכים – מכל מקום, בכל שעה.
                  </p>
                </div>

                <div className="bg-gradient-to-l from-orange-50 to-amber-50 p-6 rounded-xl border border-orange-100">
                  <h3 className="text-xl font-bold text-[#2F3C7E] mb-3">תובנות חכמות</h3>
                  <p className="text-gray-700 leading-relaxed">
                    דאשבורד חי שמראה איפה הכסף שלכם מסתתר ומי הליד הבא שצריך טיפול.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-[#2F3C7E] mb-6">מה אנחנו מציעים</h2>
              <ul className="space-y-3 text-gray-700 text-lg">
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-[#4CAF50] rounded-full flex-shrink-0"></span>
                  14 יום ניסיון מלא – ללא כרטיס אשראי
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-[#4CAF50] rounded-full flex-shrink-0"></span>
                  תמיכה אישית ב-WhatsApp ובטלפון
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-[#4CAF50] rounded-full flex-shrink-0"></span>
                  סרטוני הדרכה קצרים וברורים
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-[#4CAF50] rounded-full flex-shrink-0"></span>
                  פיצ'רים מתעדכנים לפי בקשות הקהילה
                </li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-[#2F3C7E] mb-6">לאן אנחנו הולכים</h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                אנחנו ממשיכים לפתח אינטגרציות למימון, ביטוח, מודולי חתימה דיגיטלית ועוד. החזון: להפוך את CarsLead לפלטפורמה הכול-ב-אחד שמנהלת את כל שרשרת המכירה של סוחר הרכב הישראלי – ומשם לפרוץ גם לשווקים נוספים.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-[#2F3C7E] mb-6">יש לכם רעיון, שאלה או פידבק?</h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                כתבו לנו ב-<a href="mailto:gavrielsgs@gmail.com" className="text-[#2F3C7E] hover:underline font-medium">gavrielsgs@gmail.com</a> או דרך עמוד <a href="/contact" className="text-[#2F3C7E] hover:underline font-medium">"צור קשר"</a>.
              </p>
              <p className="text-gray-700 leading-relaxed text-lg mt-4 font-medium">
                ברוכים הבאים למשפחת CarsLead – מוכרים, לא מתעסקים. 🚗
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200 text-center">
            <a 
              href="/" 
              className="inline-flex items-center px-6 py-3 bg-[#2F3C7E] text-white rounded-xl font-medium hover:bg-[#1A2347] transition-colors"
            >
              חזרה לעמוד הבית
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

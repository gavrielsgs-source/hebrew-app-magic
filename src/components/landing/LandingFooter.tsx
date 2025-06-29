
import { Car } from 'lucide-react';

export function LandingFooter() {
  return (
    <footer className="bg-gray-900 text-white py-8 md:py-12 w-full">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#2F3C7E] to-[#4CAF50] rounded-xl flex items-center justify-center">
                <Car className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">CarsLead</span>
            </div>
            <p className="text-gray-400">
              מערכת הלידים המתקדמת לסוחרי רכב בישראל
            </p>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">תמיכה</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white">מרכז עזרה</a></li>
              <li><a href="#" className="hover:text-white">צור קשר</a></li>
              <li><a href="#" className="hover:text-white">סרטוני הדרכה</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">החברה</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white">אודותינו</a></li>
              <li><a href="#" className="hover:text-white">הבלוג שלנו</a></li>
              <li><a href="#" className="hover:text-white">משרות</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">משפטי</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="/terms-of-service" className="hover:text-white">תנאי שימוש</a></li>
              <li><a href="/privacy-policy" className="hover:text-white">מדיניות פרטיות</a></li>
              <li><a href="#" className="hover:text-white">תנאי התשלום</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>© 2025 CarsLead – מערכת הלידים של ישראל. כל הזכויות שמורות.</p>
        </div>
      </div>
    </footer>
  );
}


import { Mail, Phone, MessageCircle, MapPin, Clock, Send } from 'lucide-react';
import { NavigationHeader } from '@/components/landing/NavigationHeader';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

export default function Contact() {
  const { user, loading } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const contactInfo = [
    {
      icon: Mail,
      title: 'מייל',
      value: 'gavrielsgs@gmail.com',
      action: 'mailto:gavrielsgs@gmail.com',
      description: 'נשמח לענות על כל שאלה'
    },
    {
      icon: Phone,
      title: 'טלפון',
      value: '050-271-0262',
      action: 'tel:0502710262',
      description: 'זמינים בכל שעות היום'
    },
    {
      icon: MessageCircle,
      title: 'וואטסאפ',
      value: '050-271-0262',
      action: 'https://wa.me/972502710262',
      description: 'התחל שיחה מהירה'
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Create WhatsApp message with form data
    const message = `שלום! אני מעוניין ליצור קשר:\n\nשם: ${formData.name}\nמייל: ${formData.email}\nטלפון: ${formData.phone}\n\nהודעה: ${formData.message}`;
    const whatsappUrl = `https://wa.me/972502710262?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 w-full" dir="rtl">
      <NavigationHeader user={user} loading={loading} />
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 md:py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-[#2F3C7E] to-[#4CAF50] bg-clip-text text-transparent">
            צור קשר
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-12 leading-relaxed">
            יש לכם שאלות? רוצים הדגמה אישית? אנחנו כאן בשבילכם!
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-[#2F3C7E]">
                בואו נתחיל לדבר
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                המערכת שלנו נבנתה על ידי גבריאל, סוחר רכב מנוסה שמבין בדיוק את הצרכים שלכם. 
                אנחנו כאן לענות על כל שאלה ולעזור לכם למצוא את הפתרון המושלם עבור העסק שלכם.
              </p>
            </div>

            {/* Contact Cards */}
            <div className="space-y-4">
              {contactInfo.map((contact, index) => (
                <div key={index} className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#2F3C7E] to-[#4CAF50] rounded-xl flex items-center justify-center ml-4">
                        <contact.icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-[#2F3C7E] mb-1">
                          {contact.title}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {contact.description}
                        </p>
                      </div>
                    </div>
                    <a
                      href={contact.action}
                      target={contact.title === 'וואטסאפ' ? '_blank' : undefined}
                      rel={contact.title === 'וואטסאפ' ? 'noopener noreferrer' : undefined}
                      className="text-lg font-bold text-[#2F3C7E] hover:text-[#4CAF50] transition-colors"
                    >
                      {contact.value}
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Business Hours */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/50">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#2F3C7E] to-[#4CAF50] rounded-xl flex items-center justify-center ml-4">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-[#2F3C7E]">שעות פעילות</h3>
              </div>
              <div className="space-y-2 text-gray-600">
                <div className="flex justify-between">
                  <span>ראשון - חמישי</span>
                  <span>08:00 - 20:00</span>
                </div>
                <div className="flex justify-between">
                  <span>שישי</span>
                  <span>08:00 - 15:00</span>
                </div>
                <div className="flex justify-between">
                  <span>שבת</span>
                  <span>לפי תיאום מראש</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50">
            <h3 className="text-2xl font-bold mb-6 text-[#2F3C7E]">
              שלחו לנו הודעה
            </h3>
            <p className="text-gray-600 mb-6">
              מלאו את הפרטים ואנחנו ניצור איתכם קשר בהקדם
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name" className="text-gray-700 font-medium">
                  שם מלא *
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-2 border-gray-300 focus:border-[#2F3C7E] focus:ring-[#2F3C7E]"
                  placeholder="הכניסו את השם המלא שלכם"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-gray-700 font-medium">
                  כתובת מייל *
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-2 border-gray-300 focus:border-[#2F3C7E] focus:ring-[#2F3C7E]"
                  placeholder="example@domain.com"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="text-gray-700 font-medium">
                  מספר טלפון
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="mt-2 border-gray-300 focus:border-[#2F3C7E] focus:ring-[#2F3C7E]"
                  placeholder="050-000-0000"
                />
              </div>

              <div>
                <Label htmlFor="message" className="text-gray-700 font-medium">
                  הודעה *
                </Label>
                <textarea
                  id="message"
                  name="message"
                  required
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={4}
                  className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2F3C7E] focus:border-[#2F3C7E]"
                  placeholder="ספרו לנו על הצרכים שלכם או שאלו כל שאלה..."
                />
              </div>

              <Button 
                type="submit"
                className="w-full bg-gradient-to-r from-[#2F3C7E] to-[#4CAF50] hover:from-[#1A2347] hover:to-[#45A049] text-white font-bold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Send className="h-5 w-5" />
                שלח הודעה בוואטסאפ
              </Button>
              
              <p className="text-sm text-gray-500 text-center">
                הטופס ישלח אותכם לוואטסאפ עם הפרטים שמילאתם
              </p>
            </form>
          </div>
        </div>
      </div>

      <LandingFooter />
    </div>
  );
}

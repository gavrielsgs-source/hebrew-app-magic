
import { CardContent } from "@/components/ui/card";
import { Phone, Mail, User, Car, MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";
import { getCarImages } from "@/lib/image-utils";

interface LeadCardContentProps {
  lead: any;
}

export function LeadCardContent({ lead }: LeadCardContentProps) {
  const [carImage, setCarImage] = useState<string | null>(null);
  const [loadingImage, setLoadingImage] = useState(false);

  useEffect(() => {
    const fetchCarImage = async () => {
      if (lead.cars?.id) {
        setLoadingImage(true);
        try {
          const images = await getCarImages(lead.cars.id);
          if (images.length > 0) {
            setCarImage(images[0]);
          }
        } catch (error) {
          console.error('Error fetching car image:', error);
        } finally {
          setLoadingImage(false);
        }
      }
    };

    fetchCarImage();
  }, [lead.cars?.id]);

  return (
    <CardContent className="p-6 pt-0">
      <div className="space-y-4" dir="rtl">
        {/* פרטי יצירת קשר */}
        <div className="grid grid-cols-1 gap-3">
          {lead.phone && (
            <div className="flex items-center justify-between bg-gradient-to-l from-blue-50 to-white p-4 rounded-xl border border-blue-100 shadow-sm">
              <Phone className="h-5 w-5 text-[#2F3C7E] flex-shrink-0" />
              <div className="text-right">
                <div className="font-semibold text-gray-900" dir="ltr">{lead.phone}</div>
                <div className="text-xs text-gray-500 font-medium">טלפון</div>
              </div>
            </div>
          )}
          
          {lead.email && (
            <div className="flex items-center justify-between bg-gradient-to-l from-purple-50 to-white p-4 rounded-xl border border-purple-100 shadow-sm">
              <Mail className="h-5 w-5 text-purple-600 flex-shrink-0" />
              <div className="text-right">
                <div className="font-semibold text-gray-900 truncate max-w-[200px]">{lead.email}</div>
                <div className="text-xs text-gray-500 font-medium">אימייל</div>
              </div>
            </div>
          )}
        </div>
        
        {/* מטפל */}
        {lead.assigned_to && (
          <div className="flex items-center justify-between bg-gradient-to-l from-gray-50 to-white p-3 rounded-xl border border-gray-100">
            <User className="h-4 w-4 text-gray-500 flex-shrink-0" />
            <div className="text-right">
              <span className="text-sm font-semibold text-gray-700">
                {lead.profiles?.full_name || "לא ידוע"}
              </span>
              <div className="text-xs text-gray-500 font-medium">מטפל</div>
            </div>
          </div>
        )}
        
        {/* פרטי רכב */}
        {lead.cars && (
          <div className="bg-gradient-to-l from-blue-50 via-blue-25 to-white p-5 rounded-2xl border border-blue-200 shadow-sm">
            <div className="flex items-start gap-4">
              <Car className="h-6 w-6 text-[#2F3C7E] mt-1 flex-shrink-0" />
              
              <div className="flex-1">
                {/* תמונת רכב */}
                {carImage && !loadingImage && (
                  <div className="mb-4">
                    <img
                      src={carImage}
                      alt={`${lead.cars.make} ${lead.cars.model}`}
                      className="w-full h-32 object-cover rounded-xl border border-blue-200 shadow-sm"
                    />
                  </div>
                )}
                
                {loadingImage && (
                  <div className="mb-4 w-full h-32 bg-blue-100 rounded-xl animate-pulse flex items-center justify-center">
                    <Car className="h-8 w-8 text-blue-400" />
                  </div>
                )}
                
                <div className="text-right">
                  <div className="font-bold text-[#2F3C7E] text-lg mb-1">
                    {`${lead.cars.make} ${lead.cars.model} ${lead.cars.year}`}
                  </div>
                  {lead.cars.price && (
                    <div className="text-lg font-semibold text-gray-700">
                      {lead.cars.price.toLocaleString()} ₪
                    </div>
                  )}
                  <div className="text-xs text-gray-500 font-medium mt-1">פרטי רכב</div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* הערות */}
        {lead.notes && (
          <div className="bg-gradient-to-l from-amber-50 to-white border border-amber-200 p-5 rounded-2xl shadow-sm">
            <div className="flex items-start gap-3">
              <MessageSquare className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-right flex-1">
                <div className="text-sm font-semibold text-amber-700 mb-2">הערות</div>
                <p className="text-sm text-amber-800 whitespace-pre-line leading-relaxed">
                  {lead.notes}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </CardContent>
  );
}

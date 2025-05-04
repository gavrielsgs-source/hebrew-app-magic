
interface CarAdditionalDetailsProps {
  exteriorColor: string | null;
  interiorColor: string | null;
  engineSize: string | null;
  registrationYear: number | null;
}

export function CarAdditionalDetails({ 
  exteriorColor, 
  interiorColor, 
  engineSize, 
  registrationYear 
}: CarAdditionalDetailsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <h3 className="text-sm font-medium mb-1">צבע חיצוני</h3>
        <p>{exteriorColor || 'לא צוין'}</p>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-1">צבע פנימי</h3>
        <p>{interiorColor || 'לא צוין'}</p>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-1">נפח מנוע</h3>
        <p>{engineSize || 'לא צוין'}</p>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-1">שנת עלייה לכביש</h3>
        <p>{registrationYear || 'לא צוין'}</p>
      </div>
    </div>
  );
}


export const getDocumentTypeLabel = (type: string) => {
  switch (type) {
    // מסמכים קיימים
    case 'contract': return 'חוזה';
    case 'id': return 'תעודת זהות';
    case 'license': return 'רישיון נהיגה';
    case 'invoice': return 'חשבונית';
    case 'insurance': return 'פוליסת ביטוח';
    case 'other': return 'מסמך אחר';
    
    // הצעות ומכירות
    case 'quote': return 'הצעת מחיר';
    case 'sales_agreement': return 'הסכם מכר';
    case 'purchase_agreement': return 'הסכם רכש';
    case 'warranty': return 'אחריות';
    
    // מסמכי רכב חובה
    case 'registration': return 'רישוי רכב';
    case 'test_certificate': return 'תעודת בדיקה';
    case 'ownership_certificate': return 'תעודת בעלות';
    
    // מסמכי מימון
    case 'financing_agreement': return 'הסכם מימון';
    case 'loan_document': return 'מסמך הלוואה';
    case 'guarantee': return 'ערבות';
    
    // מסמכי תחזוקה
    case 'service_record': return 'רישום שירות';
    case 'maintenance_contract': return 'חוזה תחזוקה';
    
    default: return 'מסמך';
  }
};

export const getEntityLabel = (id: string | null, type: string | null, leads?: any[], cars?: any[]) => {
  if (!id || !type) return "לא משויך";
  
  if (type === 'lead') {
    const lead = leads?.find(l => l.id === id);
    return lead ? `לקוח: ${lead.name}` : "לקוח לא ידוע";
  } else if (type === 'car') {
    const car = cars?.find(c => c.id === id);
    return car ? `רכב: ${car.make} ${car.model}` : "רכב לא ידוע";
  } else if (type === 'agency') {
    return "סוכנות";
  }
  
  return "לא משויך";
};

export const truncateFileName = (name: string, maxLength: number = 30) => {
  if (name.length <= maxLength) return name;
  return name.slice(0, maxLength) + '...';
};

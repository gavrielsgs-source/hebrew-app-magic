
export const getDocumentTypeLabel = (type: string) => {
  switch (type) {
    case 'contract': return 'חוזה';
    case 'id': return 'תעודת זהות';
    case 'license': return 'רישיון';
    case 'invoice': return 'חשבונית';
    case 'insurance': return 'ביטוח';
    case 'other': return 'אחר';
    default: return type;
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

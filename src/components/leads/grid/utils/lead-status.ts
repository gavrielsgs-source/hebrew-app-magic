
export const getStatusBadgeColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'new':
      return 'bg-blue-500 text-white';
    case 'hot':
      return 'bg-red-500 text-white';
    case 'closed':
    case 'converted':
      return 'bg-gray-500 text-white';
    case 'contacted':
      return 'bg-yellow-500 text-white';
    case 'qualified':
      return 'bg-green-500 text-white';
    default:
      return 'bg-blue-500 text-white';
  }
};

export const getStatusText = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'new':
      return 'חדש';
    case 'hot':
      return 'חם';
    case 'closed':
      return 'סגור';
    case 'converted':
      return 'הומר';
    case 'contacted':
      return 'צוות';
    case 'qualified':
      return 'מוכשר';
    default:
      return 'חדש';
  }
};

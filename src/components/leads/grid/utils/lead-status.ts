
export const getStatusBadgeColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'new':
      return 'bg-blue-500 text-white hover:bg-blue-600';
    case 'contacted':
      return 'bg-yellow-500 text-white hover:bg-yellow-600';
    case 'qualified':
      return 'bg-green-500 text-white hover:bg-green-600';
    case 'converted':
      return 'bg-purple-500 text-white hover:bg-purple-600';
    case 'closed':
      return 'bg-gray-500 text-white hover:bg-gray-600';
    default:
      return 'bg-blue-500 text-white hover:bg-blue-600';
  }
};

export const getStatusText = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'new':
      return 'חדש';
    case 'contacted':
      return 'צורר';
    case 'qualified':
      return 'מוכשר';
    case 'converted':
      return 'הומר';
    case 'closed':
      return 'סגור';
    default:
      return 'חדש';
  }
};

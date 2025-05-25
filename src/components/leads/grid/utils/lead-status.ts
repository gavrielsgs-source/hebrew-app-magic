

export const getStatusBadgeColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'new':
      return 'bg-blue-500 text-white hover:bg-blue-600';
    case 'in_treatment':
      return 'bg-yellow-500 text-white hover:bg-yellow-600';
    case 'waiting':
      return 'bg-purple-500 text-white hover:bg-purple-600';
    case 'meeting_scheduled':
      return 'bg-green-500 text-white hover:bg-green-600';
    default:
      return 'bg-blue-500 text-white hover:bg-blue-600';
  }
};

export const getStatusText = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'new':
      return 'חדש';
    case 'in_treatment':
      return 'בטיפול';
    case 'waiting':
      return 'ממתין';
    case 'meeting_scheduled':
      return 'נקבעה פגישה';
    default:
      return 'חדש';
  }
};


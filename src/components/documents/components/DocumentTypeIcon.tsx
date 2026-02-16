
import { 
  FileText, 
  Shield, 
  Award, 
  Receipt, 
  User, 
  File
} from "lucide-react";

interface DocumentTypeIconProps {
  type: string;
  className?: string;
}

const iconMap: Record<string, { Icon: typeof FileText; color: string }> = {
  contract: { Icon: FileText, color: 'text-blue-600' },
  insurance: { Icon: Shield, color: 'text-green-600' },
  license: { Icon: Award, color: 'text-yellow-600' },
  invoice: { Icon: Receipt, color: 'text-purple-600' },
  id: { Icon: User, color: 'text-orange-600' },
};

const defaultIcon = { Icon: File, color: 'text-gray-600' };

export function DocumentTypeIcon({ type, className = "w-6 h-6" }: DocumentTypeIconProps) {
  const { Icon, color } = iconMap[type] || defaultIcon;
  return <Icon className={`${className} ${color}`} />;
}

export function getIconBgColor(type: string): string {
  switch (type) {
    case 'contract': return 'bg-blue-100 dark:bg-blue-900/40';
    case 'insurance': return 'bg-green-100 dark:bg-green-900/40';
    case 'license': return 'bg-yellow-100 dark:bg-yellow-900/40';
    case 'invoice': return 'bg-purple-100 dark:bg-purple-900/40';
    case 'id': return 'bg-orange-100 dark:bg-orange-900/40';
    default: return 'bg-muted';
  }
}

export function getTypeBadgeClasses(type: string): string {
  switch (type) {
    case 'contract': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300';
    case 'insurance': return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300';
    case 'license': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300';
    case 'invoice': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300';
    case 'id': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300';
    default: return 'bg-muted text-muted-foreground';
  }
}

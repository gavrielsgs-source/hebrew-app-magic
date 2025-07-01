
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

export function DocumentTypeIcon({ type, className = "w-6 h-6" }: DocumentTypeIconProps) {
  const getIconAndColor = (documentType: string) => {
    switch (documentType) {
      case 'contract':
        return { Icon: FileText, color: 'text-blue-600' };
      case 'insurance':
        return { Icon: Shield, color: 'text-green-600' };
      case 'license':
        return { Icon: Award, color: 'text-yellow-600' };
      case 'invoice':
        return { Icon: Receipt, color: 'text-purple-600' };
      case 'id':
        return { Icon: User, color: 'text-orange-600' };
      default:
        return { Icon: File, color: 'text-gray-600' };
    }
  };

  const { Icon, color } = getIconAndColor(type);

  return <Icon className={`${className} ${color}`} />;
}


import { 
  FileText, 
  Shield, 
  Award, 
  Receipt, 
  User, 
  File,
  DollarSign,
  HandHeart,
  ShoppingCart,
  Car,
  FileCheck,
  Banknote,
  CreditCard,
  Settings,
  Wrench
} from "lucide-react";

interface DocumentTypeIconProps {
  type: string;
  className?: string;
}

export function DocumentTypeIcon({ type, className = "w-6 h-6" }: DocumentTypeIconProps) {
  const getIconAndColor = (documentType: string) => {
    switch (documentType) {
      // מסמכים קיימים
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
      
      // הצעות ומכירות
      case 'quote':
        return { Icon: DollarSign, color: 'text-emerald-600' };
      case 'sales_agreement':
        return { Icon: HandHeart, color: 'text-rose-600' };
      case 'purchase_agreement':
        return { Icon: ShoppingCart, color: 'text-indigo-600' };
      case 'warranty':
        return { Icon: Shield, color: 'text-cyan-600' };
      
      // מסמכי רכב חובה
      case 'registration':
        return { Icon: Car, color: 'text-blue-700' };
      case 'test_certificate':
        return { Icon: FileCheck, color: 'text-green-700' };
      case 'ownership_certificate':
        return { Icon: Award, color: 'text-amber-600' };
      
      // מסמכי מימון
      case 'financing_agreement':
        return { Icon: Banknote, color: 'text-slate-600' };
      case 'loan_document':
        return { Icon: CreditCard, color: 'text-violet-600' };
      case 'guarantee':
        return { Icon: Shield, color: 'text-teal-600' };
      
      // מסמכי תחזוקה
      case 'service_record':
        return { Icon: Settings, color: 'text-stone-600' };
      case 'maintenance_contract':
        return { Icon: Wrench, color: 'text-zinc-600' };
      
      default:
        return { Icon: File, color: 'text-gray-600' };
    }
  };

  const { Icon, color } = getIconAndColor(type);

  return <Icon className={`${className} ${color}`} />;
}

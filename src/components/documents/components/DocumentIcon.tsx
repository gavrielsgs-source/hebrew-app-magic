
import { FileIcon, FileTextIcon, Image } from "lucide-react";

interface DocumentIconProps {
  fileType: string;
}

export function DocumentIcon({ fileType }: DocumentIconProps) {
  if (fileType?.startsWith('image/')) {
    return <Image className="h-5 w-5 text-blue-500 flex-shrink-0" />;
  } else if (fileType === 'application/pdf') {
    return <FileTextIcon className="h-5 w-5 text-red-500 flex-shrink-0" />;
  } else {
    return <FileIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />;
  }
}

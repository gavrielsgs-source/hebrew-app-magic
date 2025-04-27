
interface ImageWarningProps {
  hasImages: boolean;
}

export function ImageWarning({ hasImages }: ImageWarningProps) {
  if (!hasImages) return null;
  
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-800 text-sm">
      <p className="font-medium">שים לב:</p>
      <p>
        בגלל מגבלות של וואטסאפ, יש להוסיף את התמונות באופן ידני בכל חלונית שתיפתח
      </p>
    </div>
  );
}


interface CarDescriptionProps {
  description: string | null;
}

export function CarDescription({ description }: CarDescriptionProps) {
  if (!description) return null;
  
  return (
    <div>
      <h3 className="text-lg font-medium mb-2">תיאור</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

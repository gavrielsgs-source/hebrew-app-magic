
import { Car } from "@/types/car";
import { useIsMobile } from "@/hooks/use-mobile";
import { CarCardMobile } from "./CarCardMobile";
import { CarCardDesktop } from "./CarCardDesktop";

interface CarCardProps {
  car: Car;
  loadingImages: boolean;
  carImages: Record<string, string>;
  onEditClick: (car: Car) => void;
  onSendWhatsapp: (car: Car) => void;
  onViewDetails: (car: Car) => void;
}

export function CarCard({
  car,
  loadingImages,
  carImages,
  onEditClick,
  onSendWhatsapp,
  onViewDetails
}: CarCardProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <CarCardMobile
        car={car}
        loadingImages={loadingImages}
        carImages={carImages}
        onEditClick={onEditClick}
        onSendWhatsapp={onSendWhatsapp}
        onViewDetails={onViewDetails}
      />
    );
  }

  return (
    <CarCardDesktop
      car={car}
      loadingImages={loadingImages}
      carImages={carImages}
      onEditClick={onEditClick}
      onSendWhatsapp={onSendWhatsapp}
      onViewDetails={onViewDetails}
    />
  );
}

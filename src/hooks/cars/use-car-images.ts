import { useQuery } from "@tanstack/react-query";
import { getCarImages } from "@/lib/image-utils";

export function useCarImages(carId: string) {
  return useQuery({
    queryKey: ["car-images", carId],
    queryFn: () => getCarImages(carId),
    enabled: !!carId,
    staleTime: 0,
  });
}

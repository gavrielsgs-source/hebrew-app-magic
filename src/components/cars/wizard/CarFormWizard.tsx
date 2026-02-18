
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { carFormSchema, CarFormValues } from "../car-form-schema";
import { WizardStepper } from "./WizardStepper";
import { StepBasicInfo } from "./StepBasicInfo";
import { StepVehicleDetails } from "./StepVehicleDetails";
import { StepFinancialInfo } from "./StepFinancialInfo";
import { StepAdditionalInfo } from "./StepAdditionalInfo";
import { ChevronRight, ChevronLeft } from "lucide-react";

const STEPS = [
  { label: "מידע בסיסי" },
  { label: "פרטי הרכב" },
  { label: "מידע פיננסי" },
  { label: "מידע נוסף" },
];

// Fields required for each step (for validation before moving forward)
const STEP_FIELDS: (keyof CarFormValues)[][] = [
  ["entry_date", "license_number", "car_type", "owner_customer_id"],
  ["make", "model", "year", "kilometers"],
  ["price"],
  ["description", "model_code", "show_in_catalog"],
];

interface CarFormWizardProps {
  defaultValues: CarFormValues;
  onSubmit: (values: CarFormValues, images: File[]) => Promise<void>;
  isSubmitting?: boolean;
  submitLabel: string;
  onCancel?: () => void;
}

export function CarFormWizard({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  submitLabel,
  onCancel,
}: CarFormWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [images, setImages] = useState<File[]>([]);

  const form = useForm<CarFormValues>({
    resolver: zodResolver(carFormSchema),
    defaultValues,
    mode: "onChange",
  });

  const handleImageChange = (files: FileList | null | File[]) => {
    if (Array.isArray(files)) {
      setImages(files);
    } else if (files) {
      setImages(Array.from(files));
    } else {
      setImages([]);
    }
  };

  const goNext = async () => {
    // Validate current step fields
    const fieldsToValidate = STEP_FIELDS[currentStep].filter(f => {
      // Only validate required fields
      return ["make", "model", "year", "kilometers", "price"].includes(f);
    });
    
    if (fieldsToValidate.length > 0) {
      const isValid = await form.trigger(fieldsToValidate);
      if (!isValid) return;
    }
    
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const goPrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async (values: CarFormValues) => {
    if (isSubmitting) return;
    await onSubmit(values, images);
  };

  const isLastStep = currentStep === STEPS.length - 1;

  return (
    <Form {...form}>
        <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        className="space-y-6"
        dir="rtl"
      >
        <WizardStepper
          steps={STEPS}
          currentStep={currentStep}
          onStepClick={(step) => {
            if (step <= currentStep) setCurrentStep(step);
          }}
        />

        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">{STEPS[currentStep].label}</h3>
            
            {currentStep === 0 && <StepBasicInfo form={form} />}
            {currentStep === 1 && <StepVehicleDetails form={form} images={images} onImagesChange={handleImageChange} />}
            {currentStep === 2 && <StepFinancialInfo form={form} />}
            {currentStep === 3 && <StepAdditionalInfo form={form} />}
          </CardContent>
        </Card>

        <div className="flex justify-between items-center pt-2">
          <div className="flex gap-2">
            {onCancel && (
              <Button type="button" variant="ghost" onClick={onCancel}>
                ביטול
              </Button>
            )}
            {currentStep > 0 && (
              <Button type="button" variant="outline" onClick={goPrev}>
                <ChevronRight className="h-4 w-4 ml-1" />
                הקודם
              </Button>
            )}
          </div>

          <div>
            {isLastStep ? (
              <Button
                type="button"
                onClick={() => form.handleSubmit(handleSubmit)()}
                disabled={isSubmitting || form.formState.isSubmitting}
                className="min-w-[140px]"
              >
                {isSubmitting ? "שומר..." : submitLabel}
              </Button>
            ) : (
              <Button type="button" onClick={goNext}>
                הבא
                <ChevronLeft className="h-4 w-4 mr-1" />
              </Button>
            )}
          </div>
        </div>
      </form>
    </Form>
  );
}

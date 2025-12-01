import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ServiceCategoriesStep } from "@/components/service-request/ServiceCategoriesStep";
import { ServiceSelectionStep } from "@/components/service-request/ServiceSelectionStep";
import { RequestDetailsStep } from "@/components/service-request/RequestDetailsStep";
import { useNavigate } from "react-router-dom";

type Step = 1 | 2 | 3;

export default function ServiceRequest() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const steps = [
    { number: 1, label: "التصنيفات" },
    { number: 2, label: "التصنيفات الفرعية" },
    { number: 3, label: "المعلومات" }
  ];

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep((currentStep + 1) as Step);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="mb-6 flex items-center justify-between">
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          الرجوع إلى القائمة
        </Button>
        <h1 className="text-2xl font-bold">إضافة طلب صيانة جديد</h1>
      </div>

      {/* Progress Steps */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-bold
                    ${currentStep >= step.number 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'}
                  `}>
                    {step.number}
                  </div>
                  <span className="mt-2 text-sm font-medium">{step.label}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-1 flex-1 mx-4 ${
                    currentStep > step.number ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <div className="mb-6">
        {currentStep === 1 && (
          <ServiceCategoriesStep
            selectedCategory={selectedCategory}
            onSelectCategory={(categoryId) => {
              setSelectedCategory(categoryId);
              handleNext();
            }}
          />
        )}
        {currentStep === 2 && (
          <ServiceSelectionStep
            categoryId={selectedCategory}
            selectedServices={selectedServices}
            onSelectService={(serviceId) => {
              setSelectedServices(prev => 
                prev.includes(serviceId)
                  ? prev.filter(id => id !== serviceId)
                  : [...prev, serviceId]
              );
            }}
            onNext={handleNext}
          />
        )}
        {currentStep === 3 && (
          <RequestDetailsStep
            selectedServices={selectedServices}
            onBack={handlePrevious}
          />
        )}
      </div>

      {/* Navigation Buttons */}
      {currentStep !== 3 && (
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ArrowRight className="ml-2 h-4 w-4" />
            السابق
          </Button>
          <Button
            onClick={handleNext}
            disabled={
              (currentStep === 1 && !selectedCategory) ||
              (currentStep === 2 && selectedServices.length === 0)
            }
          >
            التالي
            <ArrowLeft className="mr-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

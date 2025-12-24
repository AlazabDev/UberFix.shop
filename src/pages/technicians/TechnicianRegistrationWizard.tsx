import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useTechnicianRegistration } from "@/hooks/useTechnicianRegistration";
import { RegistrationStepper } from "@/components/technician-registration/RegistrationStepper";
import { TechnicianRegistrationData } from "@/types/technician-registration";
import { BasicInfoStep } from "@/components/technician-registration/steps/BasicInfoStep";
import { AddressStep } from "@/components/technician-registration/steps/AddressStep";
import { InsuranceStep } from "@/components/technician-registration/steps/InsuranceStep";
import { RatesStep } from "@/components/technician-registration/steps/RatesStep";
import { TradesStep } from "@/components/technician-registration/steps/TradesStep";
import { CoverageStep } from "@/components/technician-registration/steps/CoverageStep";
import { ExtendedStep } from "@/components/technician-registration/steps/ExtendedStep";
import { UploadsStep } from "@/components/technician-registration/steps/UploadsStep";
import { SubmitStep } from "@/components/technician-registration/steps/SubmitStep";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";

const STEPS = [
  { id: 'basic', label: 'الأساسيات' },
  { id: 'address', label: 'العنوان' },
  { id: 'insurance', label: 'التأمين' },
  { id: 'rates', label: 'الأسعار' },
  { id: 'trades', label: 'المهن' },
  { id: 'coverage', label: 'التغطية' },
  { id: 'extended', label: 'إضافية' },
  { id: 'uploads', label: 'المرفقات' },
  { id: 'submit', label: 'الإرسال' },
];

export default function TechnicianRegistrationWizard() {
  const {
    formData,
    currentStep,
    isLoading,
    goToNextStep,
    goToPreviousStep,
    updateStepData,
    submitRegistration,
    submitForReview,
    setFormData,
  } = useTechnicianRegistration();

  const { toast } = useToast();
  const navigate = useNavigate();

  const handleNext = (stepData: Partial<TechnicianRegistrationData>) => {
    goToNextStep(stepData);
    toast({
      title: "تم الحفظ",
      description: "تم حفظ بياناتك محلياً",
    });
  };

  const handleBack = () => {
    goToPreviousStep();
  };

  const handleSaveAndExit = (stepData: Partial<TechnicianRegistrationData>) => {
    updateStepData(stepData);
    toast({
      title: "تم الحفظ",
      description: "يمكنك العودة لإكمال التسجيل لاحقاً",
    });
    navigate('/');
  };

  const handleSubmit = async (submitData: { password: string; agree_terms: boolean; agree_payment_terms: boolean }) => {
    // تحديث بيانات الموافقة
    const updatedData = {
      ...formData,
      agree_terms: submitData.agree_terms,
      agree_payment_terms: submitData.agree_payment_terms,
    };
    setFormData(updatedData);

    // إرسال التسجيل
    const result = await submitRegistration(
      submitData.password,
      formData.services,
      formData.trades,
      formData.coverage_areas,
      formData.documents
    );

    if (result.success && result.profile_id) {
      // تحديث حالة الطلب للمراجعة
      const reviewResult = await submitForReview(result.profile_id);
      
      if (reviewResult.success) {
        toast({
          title: "تم التسجيل بنجاح! 🎉",
          description: "سيتم مراجعة طلبك خلال 24-48 ساعة",
        });
        navigate('/technicians/registration/thank-you');
      } else {
        toast({
          title: "تم إنشاء الحساب",
          description: "لكن حدث خطأ في إرسال الطلب للمراجعة. يرجى تسجيل الدخول والمحاولة مرة أخرى.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "خطأ في التسجيل",
        description: result.error || "حدث خطأ غير متوقع",
        variant: "destructive",
      });
    }
  };

  const steps = STEPS.map((step, index) => ({
    ...step,
    completed: index < currentStep,
    current: index === currentStep,
  }));

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-foreground">استمارة تسجيل المورد</h1>
          <p className="text-muted-foreground mt-2">
            انضم إلى شبكة الفنيين المحترفين في UberFix
          </p>
        </div>

        {/* Progress info */}
        <div className="flex items-center justify-between mb-4 text-sm text-muted-foreground">
          <span>الخطوة {currentStep + 1} من {STEPS.length}</span>
          <div className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            <span>يتم حفظ بياناتك تلقائياً</span>
          </div>
        </div>

        {/* Stepper */}
        <Card className="p-6 mb-6">
          <RegistrationStepper steps={steps} currentStep={currentStep} />
        </Card>

        {/* Step Content */}
        <Card className="p-8">
          {currentStep === 0 && (
            <BasicInfoStep 
              data={formData} 
              onNext={handleNext} 
              onSaveAndExit={handleSaveAndExit} 
            />
          )}
          {currentStep === 1 && (
            <AddressStep 
              data={formData} 
              onNext={handleNext} 
              onBack={handleBack} 
              onSaveAndExit={handleSaveAndExit} 
            />
          )}
          {currentStep === 2 && (
            <InsuranceStep 
              data={formData} 
              onNext={handleNext} 
              onBack={handleBack} 
              onSaveAndExit={handleSaveAndExit} 
            />
          )}
          {currentStep === 3 && (
            <RatesStep 
              data={formData} 
              onNext={handleNext} 
              onBack={handleBack} 
              onSaveAndExit={handleSaveAndExit} 
            />
          )}
          {currentStep === 4 && (
            <TradesStep 
              data={formData} 
              onNext={handleNext} 
              onBack={handleBack} 
              onSaveAndExit={handleSaveAndExit} 
            />
          )}
          {currentStep === 5 && (
            <CoverageStep 
              data={formData} 
              onNext={handleNext} 
              onBack={handleBack} 
              onSaveAndExit={handleSaveAndExit} 
            />
          )}
          {currentStep === 6 && (
            <ExtendedStep 
              data={formData} 
              onNext={handleNext} 
              onBack={handleBack} 
              onSaveAndExit={handleSaveAndExit} 
            />
          )}
          {currentStep === 7 && (
            <UploadsStep 
              data={formData} 
              onNext={handleNext} 
              onBack={handleBack} 
              onSaveAndExit={handleSaveAndExit} 
            />
          )}
          {currentStep === 8 && (
            <SubmitStep 
              data={formData} 
              onSubmit={handleSubmit} 
              onBack={handleBack}
              isLoading={isLoading}
            />
          )}
        </Card>

        {/* Back to home link */}
        <div className="mt-6 text-center">
          <Button variant="link" onClick={() => navigate('/')} className="text-muted-foreground">
            <ArrowLeft className="h-4 w-4 ml-1" />
            العودة للصفحة الرئيسية
          </Button>
        </div>
      </div>
    </div>
  );
}

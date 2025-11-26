import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { RegistrationStepper } from "@/components/technician-registration/RegistrationStepper";
import { TechnicianRegistrationData } from "@/types/technician-registration";
import { BasicInfoStep } from "@/components/technician-registration/steps/BasicInfoStep";
import { AddressStep } from "@/components/technician-registration/steps/AddressStep";
import { InsuranceStep } from "@/components/technician-registration/steps/InsuranceStep";
import { RatesStep } from "@/components/technician-registration/steps/RatesStep";
import { TradesStep } from "@/components/technician-registration/steps/TradesStep";
import { CoverageStep } from "@/components/technician-registration/steps/CoverageStep";
import { ExtendedInfoStep } from "@/components/technician-registration/steps/ExtendedInfoStep";
import { DocumentsStep } from "@/components/technician-registration/steps/DocumentsStep";
import { TermsStep } from "@/components/technician-registration/steps/TermsStep";
import { Card } from "@/components/ui/card";

const STEPS = [
  { id: 'basic', label: 'الأساسيات' },
  { id: 'address', label: 'العنوان' },
  { id: 'insurance', label: 'التأمين' },
  { id: 'rates', label: 'الأسعار' },
  { id: 'trades', label: 'المهن' },
  { id: 'coverage', label: 'نطاق التغطية' },
  { id: 'extended', label: 'معلومات إضافية' },
  { id: 'uploads', label: 'المرفقات' },
  { id: 'submit', label: 'الإقرار والإرسال' },
];

export default function TechnicianRegistrationWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [technicianId, setTechnicianId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<TechnicianRegistrationData>>({
    company_type: 'individual',
    has_insurance: false,
    accepts_emergency_jobs: false,
    accepts_national_contracts: false,
    agree_terms: false,
    agree_payment_terms: false,
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  // Initialize or load existing draft
  useEffect(() => {
    loadDraftProfile();
  }, []);

  const loadDraftProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('technician_profiles')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'draft')
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setTechnicianId(data.id);
        setFormData(data as Partial<TechnicianRegistrationData>);
      }
    } catch (error) {
      console.error('Error loading draft:', error);
    }
  };

  const saveDraft = async (stepData: Partial<TechnicianRegistrationData>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const updatedData = { ...formData, ...stepData };
      setFormData(updatedData);

      if (technicianId) {
        const { error } = await supabase
          .from('technician_profiles')
          .update({ ...updatedData, updated_at: new Date().toISOString() })
          .eq('id', technicianId);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('technician_profiles')
          .insert([{
            ...updatedData,
            user_id: user.id,
            status: 'draft',
          }])
          .select()
          .single();

        if (error) throw error;
        setTechnicianId(data.id);
      }

      toast({
        title: "تم الحفظ",
        description: "تم حفظ بياناتك بنجاح",
      });
    } catch (error: any) {
      console.error('Error saving draft:', error);
      toast({
        title: "خطأ في الحفظ",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const submitRegistration = async () => {
    try {
      if (!technicianId) throw new Error('No profile ID');

      // Update status to pending_review
      const { error } = await supabase
        .from('technician_profiles')
        .update({
          status: 'pending_review',
          submitted_at: new Date().toISOString(),
          terms_accepted_at: new Date().toISOString(),
        })
        .eq('id', technicianId);

      if (error) throw error;

      // Navigate to thank you page
      navigate('/technicians/registration/thank-you');
    } catch (error: any) {
      console.error('Error submitting registration:', error);
      toast({
        title: "خطأ في الإرسال",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleNext = async (stepData: Partial<TechnicianRegistrationData>) => {
    await saveDraft(stepData);
    
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final submission
      await submitRegistration();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSaveAndExit = async (stepData: Partial<TechnicianRegistrationData>) => {
    await saveDraft(stepData);
    navigate('/dashboard');
  };

  const steps = STEPS.map((step, index) => ({
    ...step,
    completed: index < currentStep,
    current: index === currentStep,
  }));

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-5xl mx-auto px-4">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-foreground">استمارة تسجيل المورد</h1>
          <p className="text-muted-foreground mt-2">
            انضم إلى شبكة الفنيين المحترفين في UberFix
          </p>
        </div>

        <Card className="p-6 mb-6">
          <RegistrationStepper steps={steps} currentStep={currentStep} />
        </Card>

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
              technicianId={technicianId}
              onNext={handleNext}
              onBack={handleBack}
              onSaveAndExit={handleSaveAndExit}
            />
          )}
          {currentStep === 4 && (
            <TradesStep
              data={formData}
              technicianId={technicianId}
              onNext={handleNext}
              onBack={handleBack}
              onSaveAndExit={handleSaveAndExit}
            />
          )}
          {currentStep === 5 && (
            <CoverageStep
              data={formData}
              technicianId={technicianId}
              onNext={handleNext}
              onBack={handleBack}
              onSaveAndExit={handleSaveAndExit}
            />
          )}
          {currentStep === 6 && (
            <ExtendedInfoStep
              data={formData}
              onNext={handleNext}
              onBack={handleBack}
              onSaveAndExit={handleSaveAndExit}
            />
          )}
          {currentStep === 7 && (
            <DocumentsStep
              data={formData}
              technicianId={technicianId}
              onNext={handleNext}
              onBack={handleBack}
              onSaveAndExit={handleSaveAndExit}
            />
          )}
          {currentStep === 8 && (
            <TermsStep
              data={formData}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
        </Card>
      </div>
    </div>
  );
}

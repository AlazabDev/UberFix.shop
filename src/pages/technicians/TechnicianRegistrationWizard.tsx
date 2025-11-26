import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { RegistrationStepper } from "@/components/technician-registration/RegistrationStepper";
import { TechnicianRegistrationData } from "@/types/technician-registration";
import { BasicInfoStep } from "@/components/technician-registration/steps/BasicInfoStep";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const STEPS = [
  { id: 'basic', label: 'الأساسيات' },
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
            company_name: updatedData.company_name || '',
            email: updatedData.email || user.email || '',
            phone: updatedData.phone || '',
            full_name: updatedData.full_name || '',
            ...updatedData,
            user_id: user.id,
            status: 'draft',
          }] as any)
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

      const { error } = await supabase
        .from('technician_profiles')
        .update({
          status: 'pending_review',
          submitted_at: new Date().toISOString(),
          terms_accepted_at: new Date().toISOString(),
        })
        .eq('id', technicianId);

      if (error) throw error;

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
          
          {currentStep > 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">باقي الخطوات قيد التطوير</p>
              <Button onClick={() => navigate('/dashboard')}>
                العودة للوحة التحكم
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

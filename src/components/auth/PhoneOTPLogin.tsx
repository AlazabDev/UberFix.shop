import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Phone, ArrowRight, ArrowLeft } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

interface PhoneOTPLoginProps {
  onBack: () => void;
}

export function PhoneOTPLogin({ onBack }: PhoneOTPLoginProps) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "");
    
    // Format Egyptian phone number
    if (digits.startsWith("20")) {
      return `+${digits}`;
    } else if (digits.startsWith("0")) {
      return `+2${digits}`;
    } else if (digits.length === 10) {
      return `+20${digits}`;
    }
    return `+20${digits}`;
  };

  const validatePhone = (phoneNumber: string) => {
    // Egyptian phone number validation
    const egyptianPhoneRegex = /^\+20(10|11|12|15)\d{8}$/;
    return egyptianPhoneRegex.test(phoneNumber);
  };

  const handleSendOTP = async () => {
    const formattedPhone = formatPhoneNumber(phone);
    
    if (!validatePhone(formattedPhone)) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال رقم هاتف مصري صحيح",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-otp", {
        body: { phone: formattedPhone },
      });

      if (error) throw error;

      if (data?.success) {
        setStep("otp");
        toast({
          title: "تم الإرسال",
          description: "تم إرسال رمز التحقق إلى هاتفك",
        });
      } else {
        throw new Error(data?.error || "فشل إرسال رمز التحقق");
      }
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "فشل إرسال رمز التحقق",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال رمز التحقق كاملاً",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const formattedPhone = formatPhoneNumber(phone);

    try {
      const { data, error } = await supabase.functions.invoke("verify-otp", {
        body: { phone: formattedPhone, otp },
      });

      if (error) throw error;

      if (!data?.success) {
        throw new Error(data?.error || "رمز التحقق غير صحيح");
      }

      if (data.session) {
        // Set session from verified OTP
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });

        toast({
          title: "تم تسجيل الدخول",
          description: "مرحباً بك",
        });
        navigate("/dashboard");
      } else {
        // OTP verified but no session - redirect to login
        toast({
          title: "تم التحقق",
          description: data.message || "تم التحقق بنجاح. يرجى تسجيل الدخول.",
        });
        navigate("/login");
      }
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "فشل التحقق",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (step === "otp") {
    return (
      <div className="space-y-4">
        <div className="text-center mb-4">
          <p className="text-sm text-muted-foreground">
            أدخل رمز التحقق المرسل إلى
          </p>
          <p className="font-medium" dir="ltr">{formatPhoneNumber(phone)}</p>
        </div>
        
        <div className="flex justify-center">
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={setOtp}
          >
            <InputOTPGroup dir="ltr">
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>

        <Button
          onClick={handleVerifyOTP}
          className="w-full"
          disabled={isLoading || otp.length !== 6}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              جاري التحقق...
            </>
          ) : (
            <>
              تأكيد
              <ArrowRight className="mr-2 h-4 w-4" />
            </>
          )}
        </Button>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => setStep("phone")}
            disabled={isLoading}
          >
            <ArrowLeft className="ml-2 h-4 w-4" />
            تغيير الرقم
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="flex-1"
            onClick={handleSendOTP}
            disabled={isLoading}
          >
            إعادة الإرسال
          </Button>
        </div>

        <Button
          type="button"
          variant="link"
          className="w-full"
          onClick={onBack}
        >
          العودة لتسجيل الدخول بالإيميل
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="phone">رقم الهاتف</Label>
        <div className="relative">
          <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="01xxxxxxxxx"
            className="pr-10"
            dir="ltr"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          أدخل رقم هاتفك المصري لاستلام رمز التحقق
        </p>
      </div>

      <Button
        onClick={handleSendOTP}
        className="w-full"
        disabled={isLoading || !phone}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            جاري الإرسال...
          </>
        ) : (
          <>
            إرسال رمز التحقق
            <ArrowRight className="mr-2 h-4 w-4" />
          </>
        )}
      </Button>

      <Button
        type="button"
        variant="link"
        className="w-full"
        onClick={onBack}
      >
        العودة لتسجيل الدخول بالإيميل
      </Button>
    </div>
  );
}

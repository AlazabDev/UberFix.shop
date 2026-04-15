import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowLeft, MessageCircle, Mail } from "lucide-react";
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
    const digits = value.replace(/\D/g, "");
    if (digits.startsWith("20")) return `+${digits}`;
    if (digits.startsWith("0")) return `+2${digits}`;
    if (digits.length === 10) return `+20${digits}`;
    return `+20${digits}`;
  };

  const validatePhone = (phoneNumber: string) => {
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
        body: { phone: formattedPhone, channel: "whatsapp" },
      });

      if (error) throw error;

      if (data?.success) {
        setStep("otp");
        toast({
          title: "تم الإرسال",
          description: "تم إرسال رمز التحقق عبر واتساب",
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
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-[#25D366]/10 rounded-full flex items-center justify-center mx-auto">
            <MessageCircle className="h-7 w-7 text-[#25D366]" />
          </div>
          <p className="text-sm text-muted-foreground">
            أدخل رمز التحقق المرسل عبر واتساب إلى
          </p>
          <p className="font-semibold text-foreground" dir="ltr">{formatPhoneNumber(phone)}</p>
        </div>
        
        <div className="flex justify-center">
          <InputOTP maxLength={6} value={otp} onChange={setOtp}>
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
          className="w-full bg-[#25D366] hover:bg-[#1da851] text-white"
          disabled={isLoading || otp.length !== 6}
        >
          {isLoading ? (
            <><Loader2 className="ml-2 h-4 w-4 animate-spin" />جاري التحقق...</>
          ) : (
            "تأكيد رمز التحقق"
          )}
        </Button>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => { setStep("phone"); setOtp(""); }}
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

        <Button type="button" variant="link" className="w-full" onClick={onBack}>
          <Mail className="ml-2 h-4 w-4" />
          تسجيل الدخول بالبريد الإلكتروني
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* WhatsApp Header */}
      <div className="text-center space-y-3">
        <h3 className="text-xl font-bold text-foreground">تسجيل الدخول عبر واتساب</h3>
        <div className="w-14 h-14 bg-[#25D366]/10 rounded-full flex items-center justify-center mx-auto">
          <MessageCircle className="h-7 w-7 text-[#25D366]" />
        </div>
        <p className="text-sm text-muted-foreground">
          أدخل رقم هاتفك وسنرسل لك رمز تحقق عبر واتساب
        </p>
      </div>

      {/* Phone Input */}
      <div className="space-y-2">
        <Label htmlFor="phone" className="text-right block">رقم الهاتف</Label>
        <div className="flex gap-2" dir="ltr">
          <div className="flex items-center justify-center px-3 bg-muted rounded-md border text-sm font-medium min-w-[60px]">
            +20
          </div>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="5XXXXXXXX"
            className="flex-1"
            dir="ltr"
          />
        </div>
      </div>

      <Button
        onClick={handleSendOTP}
        className="w-full bg-[#25D366] hover:bg-[#1da851] text-white h-12 text-base"
        disabled={isLoading || !phone}
      >
        {isLoading ? (
          <><Loader2 className="ml-2 h-4 w-4 animate-spin" />جاري الإرسال...</>
        ) : (
          <><MessageCircle className="ml-2 h-5 w-5" />إرسال رمز التحقق</>
        )}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">أو</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={onBack}
      >
        <Mail className="ml-2 h-4 w-4" />
        تسجيل الدخول بالبريد الإلكتروني
      </Button>
    </div>
  );
}

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toast } from "sonner";
import { 
  MapPin, Send, CheckCircle2, Building2, Camera, X, 
  Loader2, Wrench, Zap, Wind, Hammer, Paintbrush, Sparkles, HelpCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface PublicQuickRequestFormProps {
  property: {
    id: string;
    name: string;
    address: string;
    city?: string;
    district?: string;
  };
  locale: string;
}

type ServiceType = 'plumbing' | 'electrical' | 'ac' | 'carpentry' | 'metalwork' | 'painting' | 'cleaning' | 'other';

const SERVICES: { id: ServiceType; name_ar: string; name_en: string; icon: React.ReactNode; color: string }[] = [
  { id: "plumbing", name_ar: "سباكة", name_en: "Plumbing", icon: <Wrench className="h-6 w-6" />, color: "bg-blue-500" },
  { id: "electrical", name_ar: "كهرباء", name_en: "Electrical", icon: <Zap className="h-6 w-6" />, color: "bg-yellow-500" },
  { id: "ac", name_ar: "تكييف", name_en: "AC", icon: <Wind className="h-6 w-6" />, color: "bg-cyan-500" },
  { id: "carpentry", name_ar: "نجارة", name_en: "Carpentry", icon: <Hammer className="h-6 w-6" />, color: "bg-amber-600" },
  { id: "painting", name_ar: "دهانات", name_en: "Painting", icon: <Paintbrush className="h-6 w-6" />, color: "bg-purple-500" },
  { id: "cleaning", name_ar: "تنظيف", name_en: "Cleaning", icon: <Sparkles className="h-6 w-6" />, color: "bg-green-500" },
  { id: "other", name_ar: "أخرى", name_en: "Other", icon: <HelpCircle className="h-6 w-6" />, color: "bg-gray-500" },
];

export function PublicQuickRequestForm({ property, locale }: PublicQuickRequestFormProps) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
  const [notes, setNotes] = useState("");
  const [phone, setPhone] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isArabic = locale === "ar";
  const t = {
    title: isArabic ? "بلّغ عن مشكلة صيانة" : "Report a Maintenance Issue",
    selectService: isArabic ? "اختر نوع الصيانة" : "Select Service Type",
    takePhoto: isArabic ? "📸 صوّر المشكلة" : "📸 Take Photo",
    addPhoto: isArabic ? "إضافة صورة" : "Add Photo",
    notes: isArabic ? "ملاحظات (اختياري)" : "Notes (optional)",
    notesPlaceholder: isArabic ? "صف المشكلة باختصار..." : "Briefly describe the issue...",
    phone: isArabic ? "رقم التليفون (للمتابعة)" : "Phone (for follow-up)",
    phonePlaceholder: isArabic ? "01xxxxxxxxx" : "01xxxxxxxxx",
    submit: isArabic ? "إرسال الطلب" : "Submit Request",
    submitting: isArabic ? "جاري الإرسال..." : "Submitting...",
    successTitle: isArabic ? "تم استلام طلبك!" : "Request Received!",
    successMessage: isArabic 
      ? "سيتم التواصل معك قريباً. احتفظ برقم المتابعة:" 
      : "We'll contact you soon. Keep your tracking number:",
    trackingLabel: isArabic ? "رقم المتابعة" : "Tracking Number",
    newRequest: isArabic ? "طلب جديد" : "New Request",
    location: isArabic ? "الموقع" : "Location",
    required: isArabic ? "مطلوب" : "Required",
    maxPhotos: isArabic ? "حد أقصى 5 صور" : "Max 5 photos",
  };

  const handleImageCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = 5 - images.length;
    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    for (const file of filesToProcess) {
      try {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          setImages(prev => [...prev, base64]);
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Error reading file:', error);
      }
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!selectedService) {
      toast.error(isArabic ? "يرجى اختيار نوع الصيانة" : "Please select a service type");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('submit-public-request', {
        body: {
          property_id: property.id,
          service_type: selectedService,
          notes: notes.trim(),
          client_phone: phone.trim(),
          images: images,
        },
      });

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error('Submission failed');
      }

      setTrackingNumber(data.tracking_number);
      setSubmitted(true);
      toast.success(isArabic ? data.message_ar : data.message_en);

    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error(
        isArabic 
          ? "❌ حدث خطأ أثناء إرسال الطلب" 
          : "❌ Error submitting request"
      );
    } finally {
      setLoading(false);
    }
  };

  // Success Screen
  if (submitted && trackingNumber) {
    return (
      <Card className="shadow-2xl border-0 max-w-lg mx-auto overflow-hidden">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-8 text-white text-center">
          <div className="bg-white/20 backdrop-blur-sm p-4 rounded-full inline-flex mb-4">
            <CheckCircle2 className="h-16 w-16" />
          </div>
          <h2 className="text-2xl font-bold mb-2">{t.successTitle}</h2>
          <p className="text-white/90">{t.successMessage}</p>
        </div>
        
        <CardContent className="p-6 space-y-6">
          {/* Tracking Number */}
          <div className="bg-primary/5 border-2 border-primary/20 rounded-xl p-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">{t.trackingLabel}</p>
            <p className="text-3xl font-mono font-bold text-primary tracking-wider">
              {trackingNumber}
            </p>
          </div>

          {/* Property Info */}
          <div className="flex items-start gap-3 bg-muted/30 rounded-lg p-4">
            <MapPin className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-foreground">{property.name}</p>
              <p className="text-sm text-muted-foreground">{property.address}</p>
            </div>
          </div>

          {/* New Request Button */}
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="w-full h-12"
          >
            {t.newRequest}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-2xl border-0 max-w-lg mx-auto overflow-hidden">
      {/* Header with Property Info */}
      <CardHeader className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-6 space-y-4">
        <div className="text-center">
          <Building2 className="h-10 w-10 mx-auto mb-2 opacity-90" />
          <h1 className="text-xl font-bold">{t.title}</h1>
        </div>
        
        {/* Property Location */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 flex items-start gap-3">
          <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div className="flex-1 text-right" dir="rtl">
            <p className="font-semibold">{property.name}</p>
            <p className="text-sm opacity-80">
              {property.district && `${property.district}، `}
              {property.city && property.city}
              {!property.district && !property.city && property.address}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-6">
        {/* Step 1: Service Type Selection */}
        <div className="space-y-3">
          <Label className="text-base font-semibold flex items-center gap-2">
            <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
            {t.selectService}
            <span className="text-destructive">*</span>
          </Label>
          
          <div className="grid grid-cols-3 gap-2">
            {SERVICES.map((service) => (
              <button
                key={service.id}
                type="button"
                onClick={() => setSelectedService(service.id)}
                className={`
                  flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all
                  ${selectedService === service.id 
                    ? 'border-primary bg-primary/10 scale-105 shadow-lg' 
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  }
                `}
              >
                <div className={`${service.color} text-white p-2 rounded-lg mb-2`}>
                  {service.icon}
                </div>
                <span className="text-xs font-medium text-center">
                  {isArabic ? service.name_ar : service.name_en}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Photo Capture */}
        <div className="space-y-3">
          <Label className="text-base font-semibold flex items-center gap-2">
            <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
            {t.takePhoto}
            <span className="text-xs text-muted-foreground font-normal">({t.maxPhotos})</span>
          </Label>

          {/* Image Preview Grid */}
          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-3">
              {images.map((img, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden border-2 border-border">
                  <img src={img} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 shadow-lg"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Camera Button */}
          {images.length < 5 && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                multiple
                onChange={handleImageCapture}
                className="hidden"
                id="camera-input"
              />
              <label
                htmlFor="camera-input"
                className="flex items-center justify-center gap-3 w-full h-24 border-2 border-dashed border-primary/40 rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <Camera className="h-8 w-8 text-primary" />
                <span className="text-primary font-medium">{t.addPhoto}</span>
              </label>
            </div>
          )}
        </div>

        {/* Step 3: Notes (Optional) */}
        <div className="space-y-2">
          <Label className="text-base font-semibold flex items-center gap-2">
            <span className="bg-muted text-muted-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">3</span>
            {t.notes}
          </Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t.notesPlaceholder}
            className="min-h-[80px] resize-none"
            maxLength={500}
            dir="rtl"
          />
        </div>

        {/* Step 4: Phone (Optional for tracking) */}
        <div className="space-y-2">
          <Label className="text-base font-semibold flex items-center gap-2">
            <span className="bg-muted text-muted-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">4</span>
            {t.phone}
          </Label>
          <Input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t.phonePlaceholder}
            className="h-12"
            dir="ltr"
            maxLength={15}
          />
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={loading || !selectedService}
          className="w-full h-14 text-lg font-bold shadow-lg"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin ml-2" />
              {t.submitting}
            </>
          ) : (
            <>
              <Send className="h-5 w-5 ml-2" />
              {t.submit}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

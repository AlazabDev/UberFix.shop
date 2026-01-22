// src/pages/public/ServiceRequest.tsx
// Public service request page - no authentication required

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Send, CheckCircle, Camera, X, Wind, Zap, Droplets, Wrench, Building2, PaintBucket, Phone, MapPin, User, FileText, AlertCircle } from "lucide-react";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { Footer } from "@/components/landing/Footer";

type ServiceType = "hvac" | "electrical" | "plumbing" | "general" | "fitout" | "painting";

const serviceConfig: Record<ServiceType, { icon: any; label: string; description: string }> = {
  hvac: { icon: Wind, label: "تكييف", description: "تركيب وصيانة التكييفات" },
  electrical: { icon: Zap, label: "كهرباء", description: "أعمال كهربائية متنوعة" },
  plumbing: { icon: Droplets, label: "سباكة", description: "كشف تسريبات وصيانة" },
  general: { icon: Wrench, label: "صيانة عامة", description: "إصلاحات متنوعة" },
  fitout: { icon: Building2, label: "تجهيز محلات", description: "تشطيبات كاملة" },
  painting: { icon: PaintBucket, label: "دهانات", description: "داخلية وخارجية" },
};

export default function ServiceRequest() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const serviceParam = searchParams.get("service") as ServiceType | null;
  
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    service_type: serviceParam || "",
    client_name: "",
    client_phone: "",
    location: "",
    description: "",
    priority: "normal" as "normal" | "high" | "urgent",
  });

  // Get company and branch IDs for public submission
  const getDefaultCompanyBranch = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-default-company-branch');
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting default company/branch:', error);
      return null;
    }
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

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.service_type) {
      toast.error("يرجى اختيار نوع الخدمة");
      return;
    }
    
    if (!formData.client_name || !formData.client_phone || !formData.location) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    setLoading(true);

    try {
      // Get default company and branch
      const defaults = await getDefaultCompanyBranch();
      
      if (!defaults?.company_id || !defaults?.branch_id) {
        throw new Error("لا يمكن تحديد الشركة أو الفرع");
      }

      // Generate tracking number
      const tracking = `SR-${Date.now().toString(36).toUpperCase()}`;

      // Create maintenance request
      const { data: request, error } = await supabase
        .from('maintenance_requests')
        .insert([{
          title: `طلب ${serviceConfig[formData.service_type as ServiceType]?.label || formData.service_type}`,
          description: formData.description || `طلب خدمة ${serviceConfig[formData.service_type as ServiceType]?.label}`,
          client_name: formData.client_name,
          client_phone: formData.client_phone,
          location: formData.location,
          priority: formData.priority,
          status: 'Open',
          company_id: defaults.company_id,
          branch_id: defaults.branch_id,
          service_type: formData.service_type,
          channel: 'website',
        }])
        .select()
        .single();

      if (error) throw error;

      setTrackingNumber(request?.id?.slice(0, 8).toUpperCase() || tracking);
      setSubmitted(true);
      
      toast.success("تم إرسال طلبك بنجاح!");

    } catch (error: any) {
      console.error('Error creating request:', error);
      toast.error(error.message || "حدث خطأ أثناء إرسال الطلب");
    } finally {
      setLoading(false);
    }
  };

  const ServiceIcon = formData.service_type ? serviceConfig[formData.service_type as ServiceType]?.icon : null;

  if (submitted) {
    return (
      <div className="min-h-screen bg-background" dir="rtl">
        <LandingHeader />
        <main className="container max-w-2xl mx-auto px-4 py-12">
          <Card className="border-primary/20 shadow-xl text-center">
            <CardContent className="pt-12 pb-8 space-y-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-foreground">تم استلام طلبك بنجاح!</h2>
                <p className="text-muted-foreground">سيتم التواصل معك قريباً</p>
              </div>
              
              {trackingNumber && (
                <div className="bg-muted/50 rounded-xl p-4">
                  <p className="text-sm text-muted-foreground mb-1">رقم المتابعة</p>
                  <p className="text-2xl font-mono font-bold text-primary">{trackingNumber}</p>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button 
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({
                      service_type: "",
                      client_name: "",
                      client_phone: "",
                      location: "",
                      description: "",
                      priority: "normal",
                    });
                    setImages([]);
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  طلب جديد
                </Button>
                <Button 
                  onClick={() => navigate("/track-orders")}
                  className="flex-1"
                >
                  متابعة الطلب
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <LandingHeader />
      
      <main className="container max-w-2xl mx-auto px-4 py-8">
        <Card className="border-primary/20 shadow-xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl md:text-3xl">طلب خدمة صيانة</CardTitle>
            <CardDescription>
              املأ البيانات التالية وسنتواصل معك في أقرب وقت
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Service Type Selection */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-primary" />
                  نوع الخدمة *
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.entries(serviceConfig).map(([key, config]) => {
                    const Icon = config.icon;
                    const isSelected = formData.service_type === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setFormData({ ...formData, service_type: key })}
                        className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                          isSelected 
                            ? "border-primary bg-primary/10 text-primary" 
                            : "border-border hover:border-primary/50 hover:bg-muted/50"
                        }`}
                      >
                        <Icon className={`h-6 w-6 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                        <span className="font-medium text-sm">{config.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Client Name */}
              <div className="space-y-2">
                <Label htmlFor="client_name" className="flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  الاسم *
                </Label>
                <Input
                  id="client_name"
                  value={formData.client_name}
                  onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                  placeholder="أدخل اسمك الكامل"
                  required
                  className="text-base"
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="client_phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" />
                  رقم الهاتف *
                </Label>
                <Input
                  id="client_phone"
                  type="tel"
                  value={formData.client_phone}
                  onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })}
                  placeholder="01XXXXXXXXX"
                  required
                  className="text-base"
                  dir="ltr"
                />
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  العنوان *
                </Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="أدخل عنوانك بالتفصيل"
                  required
                  className="text-base"
                />
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <Label htmlFor="priority">الأولوية</Label>
                <Select 
                  value={formData.priority} 
                  onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">عادية</SelectItem>
                    <SelectItem value="high">عالية</SelectItem>
                    <SelectItem value="urgent">عاجلة 🔴</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  وصف المشكلة (اختياري)
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="اشرح المشكلة بالتفصيل..."
                  rows={4}
                  className="text-base"
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Camera className="h-4 w-4 text-primary" />
                  صور المشكلة (اختياري - حد أقصى 5)
                </Label>
                
                {images.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {images.map((img, index) => (
                      <div key={index} className="relative w-20 h-20">
                        <img 
                          src={img} 
                          alt={`صورة ${index + 1}`} 
                          className="w-full h-full object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center shadow-lg"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                {images.length < 5 && (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageCapture}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
                    >
                      <Camera className="h-5 w-5 text-muted-foreground" />
                      <span className="text-muted-foreground">إضافة صور</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                className="w-full gap-2 text-lg py-6"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    جاري الإرسال...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    إرسال الطلب
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}

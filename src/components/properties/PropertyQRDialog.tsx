import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Download } from "lucide-react";
import { toast } from "sonner";

interface PropertyQRDialogProps {
  propertyId: string;
  propertyName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PropertyQRDialog({
  propertyId,
  propertyName,
  open,
  onOpenChange
}: PropertyQRDialogProps) {
  const [language, setLanguage] = useState<"ar" | "en">("ar");
  const qrUrl = `${window.location.origin}/quick-request/${propertyId}?locale=${language}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(qrUrl);
    toast.success(language === "ar" ? "تم نسخ الرابط" : "Link copied");
  };

  const downloadQR = () => {
    const svg = document.getElementById(`qr-${propertyId}`);
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);

      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `QR-${propertyName}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();

      toast.success(language === "ar" ? "تم تحميل رمز QR" : "QR downloaded");
    };

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-gradient-to-br from-background to-background/95">
        <div className="absolute top-4 left-4">
          <button 
            onClick={() => onOpenChange(false)}
            className="w-8 h-8 rounded-full border-2 border-border flex items-center justify-center hover:bg-muted transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">
            {language === "ar" ? "مشاركة رابط الصيانة" : "Share Maintenance Link"}
          </h2>
        </div>

        {/* Language Toggle */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground text-center mb-3">
            {language === "ar" ? "اختر اللغة" : "Choose Language"}
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              variant={language === "ar" ? "default" : "outline"}
              onClick={() => setLanguage("ar")}
              className="flex-1 max-w-[150px] rounded-full"
            >
              العربية
            </Button>
            <Button
              variant={language === "en" ? "default" : "outline"}
              onClick={() => setLanguage("en")}
              className="flex-1 max-w-[150px] rounded-full"
            >
              English
            </Button>
          </div>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center space-y-6 py-4">
          <div className="bg-white p-8 rounded-2xl shadow-lg relative">
            <QRCodeSVG
              id={`qr-${propertyId}`}
              value={qrUrl}
              size={280}
              level="H"
              includeMargin={true}
              fgColor="#1e3a8a"
              imageSettings={{
                src: "/lovable-uploads/logo-placeholder.png",
                height: 50,
                width: 50,
                excavate: true,
              }}
            />
          </div>

          {/* Property Info */}
          <div className="text-center space-y-3 bg-muted/30 rounded-lg p-4 w-full">
            <div className="flex items-center justify-center gap-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="text-right">
                <p className="font-bold text-xl text-foreground">{propertyName}</p>
                <p className="text-sm text-muted-foreground">
                  {language === "ar" ? "وادي دجلة أكتوبر" : "Wadi Degla October"}
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground pt-2 border-t border-border/50">
              {language === "ar" ? "امسح الكود لإرسال طلب صيانة" : "Scan code to request maintenance"}
            </p>
          </div>

          {/* URL Field */}
          <div className="w-full space-y-3">
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <span className="font-medium">
                  {language === "ar" ? "وادي دجلة أكتوبر" : "Wadi Degla October"}
                </span>
              </div>
              
              <div className="bg-muted/50 rounded-lg p-3 flex items-center gap-2">
                <code className="text-xs flex-1 truncate font-mono" dir="ltr">{qrUrl}</code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={copyToClipboard}
                  className="shrink-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Download Button */}
            <Button
              onClick={downloadQR}
              className="w-full bg-primary hover:bg-primary/90 py-6 text-base font-medium rounded-xl gap-2"
            >
              <Download className="h-5 w-5" />
              {language === "ar" ? "تحميل رمز QR" : "Download QR"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

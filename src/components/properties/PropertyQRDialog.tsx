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
  const qrUrl = `${window.location.origin}/quick-request/${propertyId}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(qrUrl);
    toast.success("تم نسخ الرابط");
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

      toast.success("تم تحميل رمز QR");
    };

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {/* Language Toggle */}
        <div className="flex gap-2 justify-center mb-4">
          <Button
            variant={language === "ar" ? "default" : "outline"}
            size="sm"
            onClick={() => setLanguage("ar")}
            className="flex-1"
          >
            عربي
          </Button>
          <Button
            variant={language === "en" ? "default" : "outline"}
            size="sm"
            onClick={() => setLanguage("en")}
            className="flex-1"
          >
            English
          </Button>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center space-y-4 py-4">
          <div className="bg-white p-6 rounded-lg border-4 border-primary/20">
            <QRCodeSVG
              id={`qr-${propertyId}`}
              value={qrUrl}
              size={280}
              level="H"
              includeMargin={true}
              fgColor="#1a1f36"
            />
          </div>

          {/* Property Info */}
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <p className="font-semibold text-lg">{propertyName}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              {language === "ar" ? "امسح الكود لإرسال طلب صيانة" : "Scan to request maintenance"}
            </p>
          </div>

          {/* URL Field */}
          <div className="w-full bg-muted rounded-lg p-3 flex items-center gap-2">
            <code className="text-xs flex-1 truncate" dir="ltr">{qrUrl}</code>
            <Button
              size="sm"
              variant="ghost"
              onClick={copyToClipboard}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          {/* Download Button */}
          <Button
            onClick={downloadQR}
            className="w-full bg-primary hover:bg-primary/90"
          >
            <Download className="ml-2 h-4 w-4" />
            {language === "ar" ? "تحميل رمز QR" : "Download QR"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

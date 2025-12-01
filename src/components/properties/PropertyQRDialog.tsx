import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Download, Building2 } from "lucide-react";
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
  onOpenChange,
}: PropertyQRDialogProps) {
  const [language, setLanguage] = useState<"ar" | "en">("ar");

  const qrUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    const base = `${window.location.origin}/quick-request/${propertyId}`;
    return `${base}?locale=${language}`;
  }, [propertyId, language]);

  const copyToClipboard = () => {
    if (!qrUrl) return;
    navigator.clipboard
      .writeText(qrUrl)
      .then(() => toast.success("تم نسخ الرابط بنجاح"))
      .catch(() => toast.error("تعذّر نسخ الرابط"));
  };

  const downloadQR = () => {
    const element = document.getElementById(`qr-${propertyId}`);
    if (!element) return;
    const svg = element as unknown as SVGSVGElement;

    const serializer = new XMLSerializer();
    const svgData = serializer.serializeToString(svg);

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    const svgBlob = new Blob([svgData], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      const size = 800; // جودة عالية للطباعة
      canvas.width = size;
      canvas.height = size;
      ctx.clearRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);

      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `QR-${propertyName || "property"}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();

      URL.revokeObjectURL(url);
      toast.success("تم تحميل رمز QR");
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      toast.error("تعذّر توليد صورة رمز QR");
    };

    img.src = url;
  };

  const downloadQRPoster = () => {
    const element = document.getElementById(`qr-${propertyId}`);
    if (!element) return;
    const svg = element as unknown as SVGSVGElement;

    const serializer = new XMLSerializer();
    const svgData = serializer.serializeToString(svg);

    const svgBlob = new Blob([svgData], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const posterWidth = 900;
      const posterHeight = 1350;

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        return;
      }

      canvas.width = posterWidth;
      canvas.height = posterHeight;

      // خلفية جradient مثل التصميم
      const gradient = ctx.createLinearGradient(
        0,
        0,
        0,
        posterHeight
      );
      gradient.addColorStop(0, "#041634");
      gradient.addColorStop(1, "#062b5c");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, posterWidth, posterHeight);

      // عنوان UberFix.shop بالأعلى
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 72px system-ui, -apple-system, BlinkMacSystemFont";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText("UberFix.shop", posterWidth / 2, 70);

      // Sub-title
      ctx.font = "bold 42px system-ui, -apple-system, BlinkMacSystemFont";
      ctx.fillStyle = "#ffe18a";
      ctx.fillText(
        "Quick Maintenance Methods",
        posterWidth / 2,
        170
      );

      // صندوق أبيض للـ QR
      const cardWidth = posterWidth * 0.78;
      const cardHeight = posterHeight * 0.52;
      const cardX = (posterWidth - cardWidth) / 2;
      const cardY = 260;
      const radius = 48;

      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.moveTo(cardX + radius, cardY);
      ctx.lineTo(cardX + cardWidth - radius, cardY);
      ctx.quadraticCurveTo(
        cardX + cardWidth,
        cardY,
        cardX + cardWidth,
        cardY + radius
      );
      ctx.lineTo(
        cardX + cardWidth,
        cardY + cardHeight - radius
      );
      ctx.quadraticCurveTo(
        cardX + cardWidth,
        cardY + cardHeight,
        cardX + cardWidth - radius,
        cardY + cardHeight
      );
      ctx.lineTo(cardX + radius, cardY + cardHeight);
      ctx.quadraticCurveTo(
        cardX,
        cardY + cardHeight,
        cardX,
        cardY + cardHeight - radius
      );
      ctx.lineTo(cardX, cardY + radius);
      ctx.quadraticCurveTo(
        cardX,
        cardY,
        cardX + radius,
        cardY
      );
      ctx.closePath();
      ctx.fill();

      // رسم الـ QR داخل الصندوق
      const qrPadding = 80;
      const qrSize = cardWidth - qrPadding * 2;
      const qrX = cardX + qrPadding;
      const qrY = cardY + (cardHeight - qrSize) / 2;

      ctx.drawImage(img, qrX, qrY, qrSize, qrSize);

      // نص SCAN
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.font = "bold 80px system-ui, -apple-system, BlinkMacSystemFont";
      ctx.textBaseline = "alphabetic";
      ctx.fillText("SCAN HERE", posterWidth / 2, 1080);

      // رابط الموقع
      ctx.font = "42px system-ui, -apple-system, BlinkMacSystemFont";
      ctx.fillText(
        "www.uberfix.shop",
        posterWidth / 2,
        1160
      );

      // اسم العقار في الأسفل
      ctx.font = "32px system-ui, -apple-system, BlinkMacSystemFont";
      ctx.fillStyle = "#ffe18a";
      ctx.fillText(
        propertyName || "",
        posterWidth / 2,
        1230
      );

      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `QR-Poster-${propertyName || "property"}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();

      URL.revokeObjectURL(url);
      toast.success("تم تحميل ملصق QR للطباعة");
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      toast.error("تعذّر توليد ملصق QR");
    };

    img.src = url;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl border-0 shadow-2xl bg-gradient-to-br from-background via-background to-primary/5">
        <DialogHeader className="space-y-3 pb-2">
          <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            {language === "ar" ? "رمز QR للعقار" : "Property QR Code"}
          </DialogTitle>
          <p className="text-sm text-muted-foreground text-center">
            {language === "ar" 
              ? "شارك هذا الرمز لتسهيل طلبات الصيانة" 
              : "Share this code for easy maintenance requests"}
          </p>
        </DialogHeader>

        {/* اختيار اللغة */}
        <div className="flex gap-3 justify-center mb-4">
          <Button
            variant={language === "ar" ? "default" : "outline"}
            size="sm"
            onClick={() => setLanguage("ar")}
            className="min-w-[120px] transition-all duration-300"
          >
            العربية 🇸🇦
          </Button>
          <Button
            variant={language === "en" ? "default" : "outline"}
            size="sm"
            onClick={() => setLanguage("en")}
            className="min-w-[120px] transition-all duration-300"
          >
            English 🇬🇧
          </Button>
        </div>

        {/* QR + بيانات العقار */}
        <div className="flex flex-col items-center space-y-5 py-6">
          {/* QR Code Container */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur-xl"></div>
            <div className="relative bg-white p-8 rounded-2xl border-2 border-primary/20 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <QRCodeSVG
                id={`qr-${propertyId}`}
                value={qrUrl || "about:blank"}
                size={280}
                level="H"
                includeMargin
                bgColor="#ffffff"
                fgColor="#0b2264"
                imageSettings={{
                  src: "/logo/uberfix-pin.png",
                  height: 64,
                  width: 64,
                  excavate: true,
                }}
              />
            </div>
          </div>

          {/* معلومات العقار */}
          <div className="text-center space-y-2 w-full">
            <div className="flex items-center justify-center gap-3 px-4 py-3 bg-primary/5 rounded-xl border border-primary/10">
              <Building2 className="w-6 h-6 text-primary" />
              <p className="font-bold text-xl text-foreground">{propertyName}</p>
            </div>
            <p className="text-sm text-muted-foreground px-4">
              {language === "ar"
                ? "امسح الكود لإرسال طلب صيانة فورياً"
                : "Scan to submit an instant maintenance request"}
            </p>
          </div>

          {/* رابط الطلب */}
          <div className="w-full bg-muted/50 backdrop-blur-sm rounded-xl p-4 flex items-center gap-3 border border-border/50 hover:border-primary/30 transition-colors">
            <code className="text-xs flex-1 truncate font-mono text-foreground/80" dir="ltr">
              {qrUrl}
            </code>
            <Button
              size="icon"
              variant="ghost"
              onClick={copyToClipboard}
              className="shrink-0 hover:bg-primary/10 hover:text-primary transition-all"
              aria-label="نسخ الرابط"
            >
              <Copy className="h-5 w-5" />
            </Button>
          </div>

          {/* أزرار التحميل */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            <Button
              onClick={downloadQR}
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-md hover:shadow-lg transition-all duration-300"
              size="lg"
            >
              <Download className="ml-2 h-5 w-5" />
              {language === "ar" ? "تحميل رمز QR" : "Download QR"}
            </Button>

            <Button
              onClick={downloadQRPoster}
              variant="outline"
              size="lg"
              className="border-2 border-primary/40 text-primary hover:bg-primary/10 hover:border-primary shadow-md hover:shadow-lg transition-all duration-300"
            >
              <Download className="ml-2 h-5 w-5" />
              {language === "ar" ? "تحميل ملصق طباعة" : "Download Poster"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


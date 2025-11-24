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
    return `${window.location.origin}/quick-request/${propertyId}?locale=${language}`;
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-1 pb-4">
          <DialogTitle className="text-center text-lg font-bold">
            {language === "ar" ? "رمز QR للعقار" : "Property QR Code"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* اختيار اللغة */}
          <div className="flex gap-2 justify-center">
            <Button
              variant={language === "en" ? "outline" : "default"}
              size="sm"
              onClick={() => setLanguage("ar")}
              className="min-w-[100px]"
            >
              العربية 🇸🇦
            </Button>
            <Button
              variant={language === "en" ? "default" : "outline"}
              size="sm"
              onClick={() => setLanguage("en")}
              className="min-w-[100px]"
            >
              English 🇬🇧
            </Button>
          </div>

          {/* اسم العقار */}
          <div className="flex items-center justify-center gap-2 px-3 py-2 bg-accent/50 rounded-lg">
            <Building2 className="w-5 h-5 text-primary" />
            <p className="font-semibold text-base">{propertyName}</p>
          </div>

          {/* QR Code */}
          <div className="flex justify-center py-4">
            <div className="bg-white p-6 rounded-xl border-2 border-border shadow-sm">
              <QRCodeSVG
                id={`qr-${propertyId}`}
                value={qrUrl || "about:blank"}
                size={220}
                level="H"
                includeMargin
                bgColor="#ffffff"
                fgColor="#0b2264"
                imageSettings={{
                  src: "/logo/uberfix-pin.png",
                  height: 48,
                  width: 48,
                  excavate: true,
                }}
              />
            </div>
          </div>

          {/* نص التعليمات */}
          <p className="text-sm text-center text-muted-foreground px-2">
            {language === "ar"
              ? "امسح الكود لإرسال طلب صيانة فورياً"
              : "Scan to submit instant maintenance request"}
          </p>

          {/* رابط النسخ */}
          <div className="flex items-center gap-2 p-2 bg-muted rounded-lg border">
            <code className="text-xs flex-1 truncate font-mono" dir="ltr">
              {qrUrl}
            </code>
            <Button
              size="icon"
              variant="ghost"
              onClick={copyToClipboard}
              className="shrink-0 h-8 w-8"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          {/* أزرار التحميل */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button
              onClick={downloadQR}
              variant="default"
              size="sm"
              className="w-full"
            >
              <Download className="ml-1 h-4 w-4" />
              {language === "ar" ? "تحميل رمز QR" : "Download QR"}
            </Button>

            <Button
              onClick={downloadQRPoster}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <Download className="ml-1 h-4 w-4" />
              {language === "ar" ? "ملصق طباعة" : "Print Poster"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


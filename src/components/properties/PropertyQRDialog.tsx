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
    const svg = document.getElementById(
      `qr-${propertyId}`
    ) as SVGSVGElement | null;
    if (!svg) return;

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
    const svg = document.getElementById(
      `qr-${propertyId}`
    ) as SVGSVGElement | null;
    if (!svg) return;

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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            مشاركة رابط الصيانة
          </DialogTitle>
        </DialogHeader>

        {/* اختيار اللغة */}
        <div className="flex gap-2 justify-center mb-6">
          <Button
            variant={language === "ar" ? "default" : "outline"}
            size="sm"
            onClick={() => setLanguage("ar")}
            className="flex-1"
          >
            العربية
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

        {/* QR + بيانات العقار */}
        <div className="flex flex-col items-center space-y-4 py-4">
          <div className="bg-white p-6 rounded-xl border-4 border-primary/15 shadow-sm">
            <QRCodeSVG
              id={`qr-${propertyId}`}
              value={qrUrl || "about:blank"}
              size={280}
              level="H"
              includeMargin
              bgColor="#ffffff"
              fgColor="#0b2264"
              imageSettings={{
                src: "/logo/uberfix-pin.png", // ضع اللوجو هنا في public/logo/uberfix-pin.png
                height: 64,
                width: 64,
                excavate: true,
              }}
            />
          </div>

          <div className="text-center space-y-1">
            <div className="flex items-center justify-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              <p className="font-semibold text-lg">{propertyName}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              {language === "ar"
                ? "امسح الكود لإرسال طلب صيانة لهذا العقار"
                : "Scan to submit a maintenance request for this property"}
            </p>
          </div>

          {/* رابط الطلب */}
          <div className="w-full bg-muted rounded-lg p-3 flex items-center gap-2">
            <code
              className="text-xs flex-1 truncate"
              dir="ltr"
            >
              {qrUrl}
            </code>
            <Button
              size="icon"
              variant="ghost"
              onClick={copyToClipboard}
              className="shrink-0"
              aria-label="نسخ الرابط"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          {/* أزرار التحميل */}
          <div className="w-full flex flex-col sm:flex-row gap-2 mt-2">
            <Button
              onClick={downloadQR}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              <Download className="ml-2 h-4 w-4" />
              {language === "ar"
                ? "تحميل رمز QR فقط"
                : "Download QR code"}
            </Button>

            <Button
              onClick={downloadQRPoster}
              variant="outline"
              className="flex-1 border-primary/40 text-primary"
            >
              <Download className="ml-2 h-4 w-4" />
              {language === "ar"
                ? "تحميل ملصق الطباعة"
                : "Download poster"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


import { useState } from "react";
import { useTranslation } from "react-i18next";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Star, Smartphone, CheckCircle2, MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";

interface FeedbackEntry {
  id: string;
  name: string;
  device: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export default function BetaTest() {
  const { t } = useTranslation();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [device, setDevice] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackList, setFeedbackList] = useState<FeedbackEntry[]>(() => {
    try {
      const saved = localStorage.getItem("uberfix-beta-feedback");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !comment || rating === 0) return;

    setIsSubmitting(true);
    
    // Simulate a short delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const newFeedback: FeedbackEntry = {
      id: crypto.randomUUID(),
      name,
      device,
      rating,
      comment,
      createdAt: new Date().toISOString(),
    };

    const updated = [newFeedback, ...feedbackList];
    setFeedbackList(updated);
    localStorage.setItem("uberfix-beta-feedback", JSON.stringify(updated));

    // Reset form
    setName("");
    setEmail("");
    setDevice("");
    setComment("");
    setRating(0);
    setIsSubmitting(false);

    toast.success(t("beta.feedbackSuccess"));
  };

  const installSteps = [
    t("beta.step1"),
    t("beta.step2"),
    t("beta.step3"),
    t("beta.step4"),
  ];

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0a1929] via-[#0d2137] to-[#0a1929] text-white py-16 sm:py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur border border-white/10 mb-6">
            <Smartphone className="h-4 w-4 text-[#f5bf23]" />
            <span className="text-sm">Beta Testing Program</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold mb-4">{t("beta.title")}</h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">{t("beta.subtitle")}</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 space-y-12">
        {/* Download Section */}
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="border-2 border-primary/20 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Download className="h-6 w-6 text-primary" />
                </div>
                {t("beta.downloadTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground">{t("beta.downloadDesc")}</p>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 rounded-lg bg-muted">
                  <div className="text-sm text-muted-foreground">{t("beta.version")}</div>
                  <div className="font-bold text-primary">1.0.0-beta</div>
                </div>
                <div className="p-3 rounded-lg bg-muted">
                  <div className="text-sm text-muted-foreground">{t("beta.size")}</div>
                  <div className="font-bold text-primary">~25 MB</div>
                </div>
                <div className="p-3 rounded-lg bg-muted">
                  <div className="text-sm text-muted-foreground">{t("beta.lastUpdate")}</div>
                  <div className="font-bold text-primary">2026-03</div>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full text-lg py-6 gap-3"
                onClick={() => toast.info("سيتم توفير رابط التحميل قريباً")}
              >
                <Download className="h-5 w-5" />
                {t("beta.downloadBtn")}
              </Button>
            </CardContent>
          </Card>

          {/* Installation Guide */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                </div>
                {t("beta.installGuide")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {installSteps.map((step, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-sm font-bold text-primary">{index + 1}</span>
                    </div>
                    <p className="text-foreground pt-1">{step}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feedback Form */}
        <Card className="border-2 border-secondary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-secondary" />
              </div>
              {t("beta.feedbackTitle")}
            </CardTitle>
            <p className="text-muted-foreground">{t("beta.feedbackDesc")}</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitFeedback} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("beta.feedbackName")} *</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("beta.feedbackEmail")}</label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t("beta.feedbackDevice")}</label>
                <Input
                  value={device}
                  onChange={(e) => setDevice(e.target.value)}
                  placeholder="e.g. Samsung Galaxy S24, Pixel 8..."
                />
              </div>

              {/* Star Rating */}
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("beta.feedbackRating")} *</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          star <= (hoverRating || rating)
                            ? "text-[#f5bf23] fill-[#f5bf23]"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t("beta.feedbackComment")} *</label>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={t("beta.feedbackCommentPlaceholder")}
                  rows={5}
                  required
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="gap-2"
                disabled={isSubmitting || !name || !comment || rating === 0}
              >
                <Send className="h-4 w-4" />
                {t("beta.feedbackSubmit")}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Previous Feedback */}
        <div>
          <h2 className="text-2xl font-bold mb-6">{t("beta.previousFeedback")}</h2>
          {feedbackList.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                {t("beta.noFeedback")}
              </CardContent>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {feedbackList.map((fb) => (
                <Card key={fb.id}>
                  <CardContent className="pt-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{fb.name}</span>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`h-4 w-4 ${
                              s <= fb.rating ? "text-[#f5bf23] fill-[#f5bf23]" : "text-muted-foreground/20"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    {fb.device && (
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Smartphone className="h-3 w-3" />
                        {fb.device}
                      </div>
                    )}
                    <p className="text-sm text-foreground/80">{fb.comment}</p>
                    <div className="text-xs text-muted-foreground">
                      {new Date(fb.createdAt).toLocaleDateString("ar-EG")}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

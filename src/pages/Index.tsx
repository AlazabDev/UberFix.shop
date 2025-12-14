import WhatsAppStatusButtons from "@/components/whatsapp/WhatsAppStatusButtons";

const Index = () => {
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-foreground mb-8 text-center">
          UberFix - منصة الصيانة
        </h1>
        
        <WhatsAppStatusButtons />
      </div>
    </div>
  );
};

export default Index;

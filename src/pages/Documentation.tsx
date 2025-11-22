import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText, Book, HelpCircle, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Documentation() {
  const navigate = useNavigate();

  const docs = [
    {
      title: "دليل المستخدم",
      description: "شرح كامل لاستخدام نظام الصيانة",
      icon: Book,
      path: "/user-guide"
    },
    {
      title: "الأسئلة الشائعة",
      description: "إجابات على الأسئلة المتكررة",
      icon: HelpCircle,
      path: "/faq"
    },
    {
      title: "إجراءات الصيانة",
      description: "دليل الإجراءات والعمليات",
      icon: FileText,
      path: "/maintenance-procedures"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">مركز التوثيق</h1>
          <p className="text-muted-foreground mt-2">دليلك الشامل لاستخدام نظام إدارة الصيانة</p>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {docs.map((doc, index) => (
          <Card 
            key={index} 
            className="card-elegant cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-primary/50"
            onClick={() => navigate(doc.path)}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <doc.icon className="h-6 w-6 text-primary" />
                {doc.title}
              </CardTitle>
              <CardDescription>{doc.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-primary hover:gap-3 transition-all">
                <span>عرض التفاصيل</span>
                <ArrowLeft className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

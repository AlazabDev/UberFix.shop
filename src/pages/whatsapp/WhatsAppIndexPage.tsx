/**
 * صفحة WhatsApp الرئيسية
 * =======================
 * صفحة تجميعية لجميع خدمات WhatsApp
 */

import { Link } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  FileImage, 
  LayoutTemplate, 
  Settings, 
  Send,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useWhatsAppConfig } from '@/modules/whatsapp';

interface ServiceCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  badge?: string;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

function ServiceCard({ title, description, icon, href, badge, badgeVariant = 'secondary' }: ServiceCardProps) {
  return (
    <Link to={href}>
      <Card className="h-full hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              {icon}
            </div>
            {badge && (
              <Badge variant={badgeVariant}>{badge}</Badge>
            )}
          </div>
          <CardTitle className="text-lg mt-4">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="ghost" className="p-0 h-auto text-primary group-hover:underline">
            فتح
            <ArrowLeft className="h-4 w-4 mr-1" />
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function WhatsAppIndexPage() {
  const { config, isLoading, isConfigured } = useWhatsAppConfig();

  return (
    <PageContainer maxWidth="6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
            <MessageSquare className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold">WhatsApp Module</h1>
        </div>
        <p className="text-muted-foreground">
          إدارة جميع خدمات WhatsApp من مكان واحد - الرسائل، القوالب، الوسائط، والإعدادات
        </p>
      </div>

      {/* Config Status */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              ) : isConfigured ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-amber-500" />
              )}
              <div>
                <p className="font-medium">
                  {isLoading ? 'جاري التحقق...' : isConfigured ? 'WhatsApp مُفعّل' : 'يتطلب إعداد'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isConfigured 
                    ? 'جميع خدمات WhatsApp جاهزة للاستخدام'
                    : 'قم بإعداد بيانات Meta API للبدء'}
                </p>
              </div>
            </div>
            <Link to="/dashboard/whatsapp/templates">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 ml-2" />
                الإعدادات
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Services Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <ServiceCard
          title="المحادثات"
          description="عرض وإدارة رسائل WhatsApp الواردة والصادرة"
          icon={<MessageSquare className="h-6 w-6" />}
          href="/whatsapp"
          badge="الرئيسية"
        />
        
        <ServiceCard
          title="قوالب الرسائل"
          description="إنشاء وإدارة قوالب Meta المعتمدة للرسائل التسويقية"
          icon={<LayoutTemplate className="h-6 w-6" />}
          href="/dashboard/whatsapp/templates"
          badge={`${config ? 'متصل' : 'يتطلب إعداد'}`}
          badgeVariant={config ? 'default' : 'outline'}
        />
        
        <ServiceCard
          title="الوسائط"
          description="تصفح وتحميل ملفات الصور والفيديو والمستندات"
          icon={<FileImage className="h-6 w-6" />}
          href="/dashboard/whatsapp/media"
          badge="جديد"
          badgeVariant="default"
        />
        
        <ServiceCard
          title="إرسال سريع"
          description="إرسال رسائل WhatsApp مباشرة للعملاء"
          icon={<Send className="h-6 w-6" />}
          href="/whatsapp"
        />
        
        <ServiceCard
          title="سجل الرسائل"
          description="عرض سجل جميع الرسائل المرسلة والمستلمة"
          icon={<MessageSquare className="h-6 w-6" />}
          href="/message-logs"
        />
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4 mt-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">-</p>
              <p className="text-sm text-muted-foreground">رسائل اليوم</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">-</p>
              <p className="text-sm text-muted-foreground">قوالب نشطة</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">-</p>
              <p className="text-sm text-muted-foreground">ملفات وسائط</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-600">-</p>
              <p className="text-sm text-muted-foreground">قوالب قيد المراجعة</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}

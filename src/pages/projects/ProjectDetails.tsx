import { useParams } from "react-router-dom";
import { useProjectDetails } from "@/hooks/useProjects";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  FileText,
  Image as ImageIcon,
  MessageSquare,
  Maximize2,
  ExternalLink,
  Download,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Clock,
} from "lucide-react";

export default function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const { project, phases, updates, loading } = useProjectDetails(id!);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      planning: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      design: "bg-purple-500/20 text-purple-300 border-purple-500/30",
      licensing: "bg-orange-500/20 text-orange-300 border-orange-500/30",
      construction: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
      finishing: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
      completed: "bg-green-500/20 text-green-300 border-green-500/30",
      maintenance: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
      on_hold: "bg-gray-500/20 text-gray-300 border-gray-500/30",
      cancelled: "bg-red-500/20 text-red-300 border-red-500/30",
      pending: "bg-gray-500/20 text-gray-300 border-gray-500/30",
      in_progress: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
      delayed: "bg-red-500/20 text-red-300 border-red-500/30",
    };
    return colors[status] || colors.planning;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      planning: "التخطيط",
      design: "التصميم",
      licensing: "الترخيص",
      construction: "قيد التنفيذ",
      finishing: "التشطيب",
      completed: "مكتمل",
      maintenance: "صيانة دورية",
      on_hold: "معلق",
      cancelled: "ملغي",
      pending: "قيد الانتظار",
      in_progress: "قيد التنفيذ",
      delayed: "متأخر",
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Building2 className="h-20 w-20 text-muted-foreground/50 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">المشروع غير موجود</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-primary/5 border-b border-border/50">
        <div className="container mx-auto px-4 py-12 relative">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <Badge className={getStatusColor(project.status)}>
                  {getStatusLabel(project.status)}
                </Badge>
                {project.code && (
                  <span className="text-sm text-muted-foreground">الكود: {project.code}</span>
                )}
              </div>
              <h1 className="text-4xl font-bold mb-3">{project.name}</h1>
              {project.description && (
                <p className="text-lg text-muted-foreground">{project.description}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 bg-card/50 backdrop-blur border border-border/50 rounded-lg p-4">
              <Building2 className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">العميل</p>
                <p className="font-semibold">{project.client_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-card/50 backdrop-blur border border-border/50 rounded-lg p-4">
              <MapPin className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">الموقع</p>
                <p className="font-semibold">{project.location}</p>
              </div>
            </div>
            {project.start_date && (
              <div className="flex items-center gap-3 bg-card/50 backdrop-blur border border-border/50 rounded-lg p-4">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">تاريخ البداية</p>
                  <p className="font-semibold">
                    {new Date(project.start_date).toLocaleDateString("ar-EG")}
                  </p>
                </div>
              </div>
            )}
            {project.budget && (
              <div className="flex items-center gap-3 bg-card/50 backdrop-blur border border-border/50 rounded-lg p-4">
                <DollarSign className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">الميزانية</p>
                  <p className="font-semibold">{project.budget.toLocaleString("ar-EG")} جنيه</p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">نسبة الإنجاز</span>
              <span className="text-lg font-bold text-primary">{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-3" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <Tabs defaultValue="3d" className="space-y-8">
          <TabsList className="grid w-full grid-cols-6 lg:w-auto">
            <TabsTrigger value="3d">العرض 3D</TabsTrigger>
            <TabsTrigger value="phases">المراحل</TabsTrigger>
            <TabsTrigger value="updates">التحديثات</TabsTrigger>
            <TabsTrigger value="documents">المستندات</TabsTrigger>
            <TabsTrigger value="gallery">المعرض</TabsTrigger>
            <TabsTrigger value="info">معلومات</TabsTrigger>
          </TabsList>

          <TabsContent value="3d">
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">العارض الثلاثي الأبعاد</h3>
              {project.magicplan_iframe_url ? (
                <div className="space-y-4">
                  <div className="aspect-video rounded-lg overflow-hidden">
                    <iframe src={project.magicplan_iframe_url} className="w-full h-full" allowFullScreen />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Maximize2 className="h-4 w-4" />
                      ملء الشاشة
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a href={project.magicplan_iframe_url} target="_blank" rel="noopener">
                        <ExternalLink className="h-4 w-4 ml-2" />
                        فتح في نافذة جديدة
                      </a>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">لا يتوفر عرض ثلاثي الأبعاد</p>
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="phases">
            <div className="space-y-4">
              {phases.length === 0 ? (
                <Card className="p-16 text-center">
                  <p className="text-muted-foreground">لا توجد مراحل</p>
                </Card>
              ) : (
                phases.map((phase) => (
                  <Card key={phase.id} className="p-6">
                    <div className="flex justify-between mb-4">
                      <h4 className="text-lg font-bold">{phase.name}</h4>
                      <Badge className={getStatusColor(phase.status)}>
                        {getStatusLabel(phase.status)}
                      </Badge>
                    </div>
                    <Progress value={phase.progress} className="h-2 mb-2" />
                    <span className="text-sm font-bold text-primary">{phase.progress}%</span>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="updates">
            <div className="space-y-4">
              {updates.length === 0 ? (
                <Card className="p-16 text-center">
                  <MessageSquare className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">لا توجد تحديثات</p>
                </Card>
              ) : (
                updates.map((update) => (
                  <Card key={update.id} className="p-6">
                    <h4 className="font-bold mb-2">{update.title}</h4>
                    {update.description && <p className="text-muted-foreground">{update.description}</p>}
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="documents">
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-6">المستندات والتقارير</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-24 flex-col gap-2">
                  <FileText className="h-8 w-8" />
                  BOQ
                </Button>
                <Button variant="outline" className="h-24 flex-col gap-2">
                  <FileText className="h-8 w-8" />
                  المستخلص
                </Button>
                <Button variant="outline" className="h-24 flex-col gap-2">
                  <FileText className="h-8 w-8" />
                  التسليم
                </Button>
                <Button variant="outline" className="h-24 flex-col gap-2">
                  <FileText className="h-8 w-8" />
                  الجودة
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="gallery">
            <Card className="p-16 text-center">
              <ImageIcon className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">معرض الصور قريباً</p>
            </Card>
          </TabsContent>

          <TabsContent value="info">
            <Card className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">الميزانية</p>
                  <p className="font-semibold text-primary">
                    {project.budget?.toLocaleString("ar-EG") || "غير محدد"} جنيه
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">التكلفة الفعلية</p>
                  <p className="font-semibold">{project.actual_cost?.toLocaleString("ar-EG") || "0"} جنيه</p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

import { LandingHeader } from "@/components/landing/LandingHeader";
import { Footer } from "@/components/landing/Footer";
import { useState } from "react";
import { useProjects } from "@/hooks/useProjects";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { ProjectFilters } from "@/components/projects/ProjectFilters";
import { NewProjectDialog } from "@/components/projects/NewProjectDialog";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Building2 } from "lucide-react";

export default function Projects() {
  const { projects, loading, refetch } = useProjects();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Filter projects
  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      searchTerm === "" ||
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || project.status === statusFilter;

    const matchesYear =
      yearFilter === "all" ||
      (project.start_date && new Date(project.start_date).getFullYear().toString() === yearFilter);

    const matchesType =
      typeFilter === "all" ||
      (project.project_type && project.project_type.toLowerCase().includes(typeFilter.toLowerCase()));

    return matchesSearch && matchesStatus && matchesYear && matchesType;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-primary/5">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
        <div className="container mx-auto px-4 py-16 relative">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-4">
              <Building2 className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-l from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              المشروعات المعمارية المنفذة بواسطة العزب
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              تابع مشروعاتنا المعمارية المتميزة من التخطيط إلى التسليم النهائي
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 space-y-8">
        {/* Filters */}
        <ProjectFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          yearFilter={yearFilter}
          setYearFilter={setYearFilter}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
        />

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card/50 backdrop-blur border border-border/50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-primary">{projects.length}</div>
            <div className="text-sm text-muted-foreground mt-1">إجمالي المشروعات</div>
          </div>
          <div className="bg-card/50 backdrop-blur border border-border/50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-500">
              {projects.filter((p) => p.status === "completed").length}
            </div>
            <div className="text-sm text-muted-foreground mt-1">مشاريع مكتملة</div>
          </div>
          <div className="bg-card/50 backdrop-blur border border-border/50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-yellow-500">
              {projects.filter((p) => p.status === "construction").length}
            </div>
            <div className="text-sm text-muted-foreground mt-1">قيد التنفيذ</div>
          </div>
          <div className="bg-card/50 backdrop-blur border border-border/50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-500">
              {projects.filter((p) => p.status === "planning" || p.status === "design").length}
            </div>
            <div className="text-sm text-muted-foreground mt-1">في مرحلة التخطيط</div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              {filteredProjects.length === projects.length
                ? `جميع المشروعات (${projects.length})`
                : `المشروعات المفلترة (${filteredProjects.length} من ${projects.length})`}
            </h2>
          </div>
          <NewProjectDialog onSuccess={refetch} />
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="bg-card/50 backdrop-blur border border-border/50 rounded-xl p-16 text-center">
            <Building2 className="h-20 w-20 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">لا توجد مشروعات مطابقة</h3>
            <p className="text-muted-foreground mb-6">جرب تغيير معايير البحث</p>
            {projects.length === 0 && <NewProjectDialog onSuccess={refetch} />}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}

        {/* Integration Section */}
        <div className="mt-16 bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-primary/20 rounded-2xl p-8 md:p-12 text-center">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            هل ترغب في تنفيذ مشروع مشابه؟
          </h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            نقدم استشارات معمارية مجانية لمساعدتك في تحقيق رؤيتك المعمارية
          </p>
          <a
            href="/contact"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            طلب استشارة مجانية
          </a>
        </div>
      </div>
     <Footer />
    </div>
  );
}

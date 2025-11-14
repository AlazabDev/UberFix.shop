import { LandingHeader } from "@/components/landing/LandingHeader";
import { Footer } from "@/components/landing/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Camera, X, ChevronLeft, ChevronRight, RefreshCw, Loader2, Download } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useGalleryImages } from "@/hooks/useGalleryImages";
import { useToast } from "@/hooks/use-toast";

const FOLDERS = [
  { key: "all", label: "الكل", icon: "🎨" },
  { key: "commercial", label: "تجاري", icon: "🏢" },
  { key: "construction", label: "إنشائي", icon: "🏗️" },
  { key: "cuate", label: "تصميمات كرتونية", icon: "🎨" },
  { key: "live_edge", label: "خشب طبيعي", icon: "🪵" },
  { key: "maintenance", label: "صيانة", icon: "🔧" },
  { key: "residential", label: "سكني", icon: "🏠" },
  { key: "shops", label: "محلات", icon: "🏪" },
];

export default function Gallery() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const { images, loading, error, refresh } = useGalleryImages(selectedCategory);
  const { toast } = useToast();

  const handleRefresh = () => {
    refresh();
    toast({
      title: "تم التحديث",
      description: "تم تحديث الصور بنجاح",
    });
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setSelectedImageIndex(null);
  };

  const openLightbox = (index: number) => {
    setSelectedImageIndex(index);
  };

  const closeLightbox = () => {
    setSelectedImageIndex(null);
  };

  const navigateImage = (direction: "next" | "prev") => {
    if (selectedImageIndex === null) return;
    
    if (direction === "next" && selectedImageIndex < images.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1);
    } else if (direction === "prev" && selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1);
    }
  };

  const handleDownload = async (imageUrl: string, title: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast({
        title: "تم التحميل",
        description: "تم تحميل الصورة بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل تحميل الصورة",
        variant: "destructive",
      });
    }
  };
  const selectedImage = selectedImageIndex !== null ? images[selectedImageIndex] : null;

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />
      
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 bg-gradient-to-br from-primary/5 via-background to-secondary/5 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.15'%3E%3Cpath d='M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zM10 10c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10S0 25.523 0 20s4.477-10 10-10zm10 8c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm40 40c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
              <Camera className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">معرض الأعمال</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="bg-gradient-to-l from-primary via-primary/80 to-secondary bg-clip-text text-transparent">
                مشاريعنا المتميزة
              </span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              استكشف معرضنا الشامل من المشاريع المنجزة بأعلى معايير الجودة والاحترافية
            </p>
            
            <div className="flex items-center justify-center gap-3 pt-4">
              <Badge variant="secondary" className="text-sm">
                {images.length} صورة
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={loading}
                className="gap-2"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                تحديث
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Filter */}
      <section className="sticky top-0 z-30 py-6 bg-background/95 backdrop-blur-lg border-b border-border/50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-2 md:gap-3">
            {FOLDERS.map((folder) => (
              <Button
                key={folder.key}
                variant={selectedCategory === folder.key ? "default" : "outline"}
                size="lg"
                onClick={() => handleCategoryChange(folder.key)}
                className={`
                  group relative overflow-hidden transition-all duration-300
                  ${selectedCategory === folder.key 
                    ? 'shadow-lg shadow-primary/25 scale-105' 
                    : 'hover:scale-105 hover:shadow-md'
                  }
                `}
              >
                <span className="text-xl mr-2">{folder.icon}</span>
                <span className="font-semibold">{folder.label}</span>
                {selectedCategory === folder.key && (
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary-foreground/10 to-primary/0 animate-shimmer" />
                )}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          {error && (
            <div className="max-w-md mx-auto mb-8 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-center">
              <p className="text-destructive font-medium">{error}</p>
              <Button onClick={handleRefresh} variant="outline" size="sm" className="mt-3">
                إعادة المحاولة
              </Button>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
              {[...Array(12)].map((_, i) => (
                <Card key={i} className="overflow-hidden group">
                  <Skeleton className="aspect-square w-full" />
                </Card>
              ))}
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-16">
              <Camera className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-xl font-semibold mb-2">لا توجد صور</h3>
              <p className="text-muted-foreground mb-4">لم يتم العثور على صور في هذا القسم</p>
              <Button onClick={handleRefresh} variant="outline">
                <RefreshCw className="h-4 w-4 ml-2" />
                تحديث
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
              {images.map((image, index) => (
                <Card
                  key={image.id}
                  className="group overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 bg-card/50 backdrop-blur-sm border-border/50"
                >
                  <div 
                    className="relative aspect-square overflow-hidden bg-muted/50"
                    onClick={() => openLightbox(index)}
                  >
                    <img
                      src={image.url}
                      alt={image.title}
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500">
                      <div className="absolute bottom-0 left-0 right-0 p-3 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                        <p className="font-bold text-xs md:text-sm truncate mb-2">{image.title}</p>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="w-full gap-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(image.url, image.title);
                          }}
                        >
                          <Download className="h-3 w-3" />
                          تحميل
                        </Button>
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-primary/90 backdrop-blur-sm rounded-full p-2">
                        <Camera className="h-3 w-3 md:h-4 md:w-4 text-primary-foreground" />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Image Lightbox with Carousel */}
      <Dialog open={selectedImageIndex !== null} onOpenChange={closeLightbox}>
        <DialogContent className="max-w-7xl h-[90vh] p-0 overflow-hidden bg-black/98 border-0">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 left-4 z-50 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all backdrop-blur-md shadow-xl"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Download Button */}
            {selectedImage && (
              <button
                onClick={() => handleDownload(selectedImage.url, selectedImage.title)}
                className="absolute top-4 left-20 z-50 w-12 h-12 rounded-full bg-primary/90 hover:bg-primary text-primary-foreground flex items-center justify-center transition-all backdrop-blur-md shadow-xl"
              >
                <Download className="h-5 w-5" />
              </button>
            )}

            {/* Navigation Buttons */}
            {selectedImageIndex !== null && selectedImageIndex > 0 && (
              <button
                onClick={() => navigateImage("prev")}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-50 w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all backdrop-blur-md shadow-xl hover:scale-110"
              >
                <ChevronRight className="h-7 w-7" />
              </button>
            )}
            
            {selectedImageIndex !== null && selectedImageIndex < images.length - 1 && (
              <button
                onClick={() => navigateImage("next")}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-50 w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all backdrop-blur-md shadow-xl hover:scale-110"
              >
                <ChevronLeft className="h-7 w-7" />
              </button>
            )}

            {selectedImage && (
              <div className="relative w-full h-full flex flex-col">
                <div className="flex-1 flex items-center justify-center p-4">
                  <img 
                    src={selectedImage.url}
                    alt={selectedImage.title}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                  />
                </div>
                
                {/* Image Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-6 md:p-8 text-white">
                  <div className="container mx-auto">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge variant="secondary" className="text-sm">
                        {FOLDERS.find(f => f.key === selectedImage.folder)?.label}
                      </Badge>
                      <span className="text-sm text-white/60">
                        {(selectedImageIndex ?? 0) + 1} / {images.length}
                      </span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold">{selectedImage.title}</h3>
                  </div>
                </div>

                {/* Keyboard Navigation Hint */}
                <div className="absolute top-4 right-4 flex gap-2 opacity-50">
                  <kbd className="px-2 py-1 text-xs rounded bg-white/10 backdrop-blur-sm">←</kbd>
                  <kbd className="px-2 py-1 text-xs rounded bg-white/10 backdrop-blur-sm">→</kbd>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}

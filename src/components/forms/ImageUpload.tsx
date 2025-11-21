import { useRef, useState } from "react";
import { X, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  images: File[];
  onImagesChange: (images: File[]) => void;
  maxImages?: number;
}

export function ImageUpload({ images, onImagesChange, maxImages = 5 }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remainingSlots = maxImages - images.length;
    const newFiles = files.slice(0, remainingSlots);

    // إنشاء معاينات للصور
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
    setPreviews([...previews, ...newPreviews]);
    onImagesChange([...images, ...newFiles]);
  };

  const handleRemoveImage = (index: number) => {
    // تحرير الذاكرة
    URL.revokeObjectURL(previews[index]);
    
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    
    setPreviews(newPreviews);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {previews.map((preview, index) => (
          <div
            key={index}
            className="relative group aspect-video rounded-lg overflow-hidden border-2 border-border"
          >
            <img
              src={preview}
              alt={`صورة ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => handleRemoveImage(index)}
              className="absolute top-2 left-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}

        {images.length < maxImages && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "aspect-video rounded-lg border-2 border-dashed border-border",
              "hover:border-primary hover:bg-primary/5 transition-colors",
              "flex flex-col items-center justify-center gap-2",
              "text-muted-foreground hover:text-primary"
            )}
          >
            <Upload className="h-8 w-8" />
            <span className="text-sm">رفع صورة</span>
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      <p className="text-xs text-muted-foreground">
        يمكنك رفع حتى {maxImages} صور. الصور المسموح بها: JPG, PNG, WEBP (حد أقصى 5MB لكل صورة)
      </p>
    </div>
  );
}

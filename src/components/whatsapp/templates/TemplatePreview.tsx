import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Smartphone } from 'lucide-react';
import type { WATemplate, TemplateButton } from '@/hooks/useWhatsAppTemplates';

interface TemplatePreviewProps {
  template: Partial<WATemplate>;
  className?: string;
}

export function TemplatePreview({ template, className = '' }: TemplatePreviewProps) {
  // Replace placeholders with sample values
  const formatText = (text: string) => {
    return text.replace(/\{\{(\d+)\}\}/g, (_, num) => `[متغير ${num}]`);
  };

  const renderButtons = (buttons: TemplateButton[] = []) => {
    if (!buttons.length) return null;

    return (
      <div className="flex flex-col gap-2 mt-2">
        {buttons.map((button, index) => (
          <button
            key={index}
            className="w-full py-2 px-4 text-sm text-[#00a884] bg-transparent border-t border-[#e9edef] hover:bg-[#f0f2f5] transition-colors"
          >
            {button.type === 'URL' && '🔗 '}
            {button.type === 'PHONE_NUMBER' && '📞 '}
            {button.text}
          </button>
        ))}
      </div>
    );
  };

  return (
    <Card className={`bg-[#efeae2] ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
          <Smartphone className="h-4 w-4" />
          معاينة الرسالة
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center">
          {/* WhatsApp Message Bubble */}
          <div className="bg-white rounded-lg shadow-sm max-w-[280px] w-full overflow-hidden">
            {/* Header */}
            {template.header_type && template.header_type !== 'none' && (
              <div className="p-3 pb-0">
                {template.header_type === 'text' && template.header_content && (
                  <p className="font-bold text-sm text-gray-900">
                    {formatText(template.header_content)}
                  </p>
                )}
                {template.header_type === 'image' && (
                  <div className="bg-gray-200 rounded h-32 flex items-center justify-center">
                    <span className="text-gray-500 text-sm">🖼️ صورة</span>
                  </div>
                )}
                {template.header_type === 'video' && (
                  <div className="bg-gray-200 rounded h-32 flex items-center justify-center">
                    <span className="text-gray-500 text-sm">🎬 فيديو</span>
                  </div>
                )}
                {template.header_type === 'document' && (
                  <div className="bg-gray-100 rounded p-3 flex items-center gap-2">
                    <span className="text-2xl">📄</span>
                    <span className="text-gray-600 text-sm">مستند</span>
                  </div>
                )}
              </div>
            )}

            {/* Body */}
            <div className="p-3">
              <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed text-right" dir="rtl">
                {template.body_text ? formatText(template.body_text) : 'نص الرسالة...'}
              </p>
            </div>

            {/* Footer */}
            {template.footer_text && (
              <div className="px-3 pb-2">
                <p className="text-xs text-gray-500 text-right" dir="rtl">
                  {formatText(template.footer_text)}
                </p>
              </div>
            )}

            {/* Timestamp */}
            <div className="px-3 pb-2 flex justify-start">
              <span className="text-[10px] text-gray-400">12:00 م ✓✓</span>
            </div>

            {/* Buttons */}
            {renderButtons(template.buttons)}
          </div>
        </div>

        {/* Template Info */}
        <div className="mt-4 flex flex-wrap gap-2 justify-center">
          {template.name && (
            <Badge variant="outline" className="font-mono text-xs">
              {template.name}
            </Badge>
          )}
          {template.category && (
            <Badge variant="secondary" className="text-xs">
              {template.category === 'utility' && 'أداة مساعدة'}
              {template.category === 'marketing' && 'تسويق'}
              {template.category === 'authentication' && 'مصادقة'}
            </Badge>
          )}
          {template.language && (
            <Badge variant="outline" className="text-xs">
              {template.language === 'ar' ? 'العربية' : template.language}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

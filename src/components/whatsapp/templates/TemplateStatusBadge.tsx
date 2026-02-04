import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  PauseCircle, 
  FileText, 
  Send, 
  Ban,
  AlertTriangle 
} from 'lucide-react';
import type { TemplateStatus, TemplateQuality } from '@/hooks/useWhatsAppTemplates';

interface TemplateStatusBadgeProps {
  status: TemplateStatus;
  reason?: string | null;
}

export function TemplateStatusBadge({ status, reason }: TemplateStatusBadgeProps) {
  const statusConfig: Record<TemplateStatus, { 
    label: string; 
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
    icon: React.ReactNode;
    className: string;
  }> = {
    draft: {
      label: 'مسودة',
      variant: 'secondary',
      icon: <FileText className="h-3 w-3" />,
      className: 'bg-gray-100 text-gray-700 border-gray-300',
    },
    submitted: {
      label: 'تم الإرسال',
      variant: 'default',
      icon: <Send className="h-3 w-3" />,
      className: 'bg-blue-100 text-blue-700 border-blue-300',
    },
    pending: {
      label: 'قيد المراجعة',
      variant: 'default',
      icon: <Clock className="h-3 w-3" />,
      className: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    },
    approved: {
      label: 'معتمد',
      variant: 'default',
      icon: <CheckCircle className="h-3 w-3" />,
      className: 'bg-green-100 text-green-700 border-green-300',
    },
    rejected: {
      label: 'مرفوض',
      variant: 'destructive',
      icon: <XCircle className="h-3 w-3" />,
      className: 'bg-red-100 text-red-700 border-red-300',
    },
    paused: {
      label: 'موقوف',
      variant: 'default',
      icon: <PauseCircle className="h-3 w-3" />,
      className: 'bg-orange-100 text-orange-700 border-orange-300',
    },
    disabled: {
      label: 'معطل',
      variant: 'secondary',
      icon: <Ban className="h-3 w-3" />,
      className: 'bg-gray-200 text-gray-600 border-gray-400',
    },
    deleted: {
      label: 'محذوف',
      variant: 'secondary',
      icon: <Ban className="h-3 w-3" />,
      className: 'bg-gray-300 text-gray-500 border-gray-400',
    },
  };

  const config = statusConfig[status] || statusConfig.draft;

  const badge = (
    <Badge 
      variant="outline" 
      className={`gap-1 ${config.className} border`}
    >
      {config.icon}
      {config.label}
    </Badge>
  );

  if (reason) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-flex items-center gap-1 cursor-help">
            {badge}
            <AlertTriangle className="h-3 w-3 text-destructive" />
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs text-right">
          <p className="text-sm">{reason}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return badge;
}

interface TemplateQualityBadgeProps {
  quality: TemplateQuality;
  reason?: string | null;
}

export function TemplateQualityBadge({ quality, reason }: TemplateQualityBadgeProps) {
  const qualityConfig: Record<TemplateQuality, { 
    label: string; 
    className: string;
  }> = {
    high: {
      label: 'عالية',
      className: 'bg-green-100 text-green-700 border-green-300',
    },
    medium: {
      label: 'متوسطة',
      className: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    },
    low: {
      label: 'منخفضة',
      className: 'bg-red-100 text-red-700 border-red-300',
    },
    unknown: {
      label: 'غير محددة',
      className: 'bg-gray-100 text-gray-500 border-gray-300',
    },
  };

  const config = qualityConfig[quality] || qualityConfig.unknown;

  const badge = (
    <Badge variant="outline" className={`${config.className} border`}>
      {config.label}
    </Badge>
  );

  if (reason) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="cursor-help">{badge}</span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs text-right">
          <p className="text-sm">{reason}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return badge;
}

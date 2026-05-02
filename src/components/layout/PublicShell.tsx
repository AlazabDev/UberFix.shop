import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Home, Shield, MessageCircle, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { openWhatsApp } from '@/config/whatsapp';

interface PublicShellProps {
  children: ReactNode;
  /** عنوان فرعي يظهر تحت اسم العلامة في الهيدر */
  subtitle?: string;
  /** إخفاء أزرار العودة/التواصل في الهيدر */
  hideHeaderActions?: boolean;
  /** تخصيص أقصى عرض للحاوية الداخلية */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
}

const widthMap: Record<NonNullable<PublicShellProps['maxWidth']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
};

/**
 * PublicShell — القالب البصري الموحّد لكل الصفحات العامة في UberFix
 * (تتبع، فاتورة، طلب عام، تقييم… إلخ).
 *
 * الهوية: لون Uber #030957 + Fix #FFB900 + خلفية متدرجة ناعمة + RTL.
 */
export function PublicShell({
  children,
  subtitle = 'منصة الصيانة الذكية',
  hideHeaderActions = false,
  maxWidth = '2xl',
}: PublicShellProps) {
  return (
    <div
      className="min-h-screen bg-gradient-to-b from-[#030957]/5 via-background to-background"
      dir="rtl"
    >
      {/* Header — Brand */}
      <header className="bg-[#030957] text-white shadow-md print:hidden">
        <div className={`mx-auto px-4 py-3 flex items-center justify-between ${widthMap[maxWidth]}`}>
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center group-hover:bg-white/25 transition-colors">
              <Shield className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <h1 className="font-bold text-lg">
                <span>Uber</span>
                <span className="text-[#FFB900]">Fix</span>
              </h1>
              <p className="text-[11px] opacity-80">{subtitle}</p>
            </div>
          </Link>

          {!hideHeaderActions && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10 h-9 w-9"
                onClick={() => openWhatsApp('مرحباً، أحتاج المساعدة')}
                aria-label="واتساب"
              >
                <MessageCircle className="h-4 w-4" />
              </Button>
              <a href="tel:+15557285727" aria-label="اتصل بنا">
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 h-9 w-9">
                  <Phone className="h-4 w-4" />
                </Button>
              </a>
              <Link to="/" aria-label="الرئيسية">
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 h-9 w-9">
                  <Home className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}
        </div>
        {/* خط الهوية الذهبي */}
        <div className="h-1 bg-gradient-to-l from-[#FFB900] via-[#FFB900]/70 to-transparent" />
      </header>

      {/* Content */}
      <main className={`mx-auto px-4 py-6 ${widthMap[maxWidth]}`}>{children}</main>

      {/* Footer */}
      <footer className="mt-8 pb-6 print:hidden">
        <div className={`mx-auto px-4 ${widthMap[maxWidth]}`}>
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              شكراً لثقتك في{' '}
              <span className="font-bold">
                <span className="text-[#030957]">Uber</span>
                <span className="text-[#FFB900]">Fix</span>
              </span>
            </p>
            <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <Shield className="h-3 w-3" />
              <span>بياناتك محمية ومشفرة وفق قانون 151 لسنة 2020</span>
            </div>
            <p className="text-[11px] text-muted-foreground/70">
              © {new Date().getFullYear()} UberFix — جميع الحقوق محفوظة
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default PublicShell;
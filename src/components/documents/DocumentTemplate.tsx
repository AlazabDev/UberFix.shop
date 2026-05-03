import { ReactNode } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import stampImg from '@/assets/uberfix-stamp.png';

/**
 * DocumentTemplate — القالب البصري الموحّد لكل المستندات الرسمية في UberFix
 * (فاتورة، عرض سعر، إيصال، خطاب رسمي، تقرير، شهادة...).
 *
 * مستوحى من قالب الـ Corporate Invoice الاحترافي:
 *  - رأس Navy داكن مائل + شريط Gold قطري
 *  - رأس جدول/أقسام بلون Gold
 *  - تذييل Navy مرآة للرأس
 *
 * يحترم الهوية: Navy #030957 + Gold #FFB900 + خط Cairo + RTL.
 */

export interface DocumentField {
  label: string;
  value: ReactNode;
}

interface DocumentTemplateProps {
  /** نوع المستند بالعربي — يظهر كبيراً في الزاوية العلوية */
  documentType: string;
  /** الترجمة اللاتينية تحت النوع — اختياري */
  documentTypeLatin?: string;
  /** رقم/معرّف المستند */
  documentId?: string;
  /** التاريخ المعروض في الرأس */
  documentDate?: string;
  /** بيانات "إلى" — اسم العميل/الجهة */
  toBlock?: { title?: string; lines: ReactNode[] };
  /** بيانات "من" — يتم تعبئتها افتراضياً ببيانات UberFix */
  fromBlock?: { title?: string; lines: ReactNode[] };
  /** أقسام الرأس الرمادية الصغيرة (Date / Ref / ...) */
  headerFields?: DocumentField[];
  /** المحتوى الرئيسي (جدول/فقرات/تفاصيل) */
  children: ReactNode;
  /** ملخص نهائي يظهر داخل بطاقة Gold (مثل: الإجمالي) */
  summary?: ReactNode;
  /** ملاحظات أسفل المستند */
  notes?: ReactNode;
  /** عرض الختم الرسمي + التوقيع */
  showStamp?: boolean;
  /** عرض QR للتحقق */
  qrUrl?: string;
  qrLabel?: string;
  /** تخصيص شعار الشركة في الرأس */
  companyName?: { primary: string; accent: string };
  companySlogan?: string;
}

const NAVY = '#030957';
const GOLD = '#FFB900';

export function DocumentTemplate({
  documentType,
  documentTypeLatin,
  documentId,
  documentDate,
  toBlock,
  fromBlock = {
    title: 'صادر من',
    lines: [
      <strong key="n">UberFix.shop</strong>,
      'منصة الصيانة الذكية المتكاملة',
      'هاتف: +1 555 728 5727',
      'support@uberfix.shop',
    ],
  },
  headerFields,
  children,
  summary,
  notes,
  showStamp = true,
  qrUrl,
  qrLabel = 'تحقّق من المستند',
  companyName = { primary: 'Uber', accent: 'Fix' },
  companySlogan = 'Smart Maintenance Platform',
}: DocumentTemplateProps) {
  return (
    <div
      className="bg-white text-gray-900 mx-auto shadow-2xl print:shadow-none relative overflow-hidden"
      dir="rtl"
      style={{
        fontFamily: 'Cairo, sans-serif',
        maxWidth: '820px',
        minHeight: '1100px',
      }}
    >
      {/* ============== HEADER ============== */}
      <div className="relative" style={{ background: NAVY }}>
        {/* Diagonal Gold Accent */}
        <div
          className="absolute top-0 right-0 h-full"
          style={{
            width: '38%',
            background: GOLD,
            clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0% 100%)',
          }}
        />
        <div
          className="absolute top-0 right-0 h-full"
          style={{
            width: '32%',
            background: NAVY,
            clipPath: 'polygon(25% 0, 100% 0, 100% 100%, 0% 100%)',
          }}
        />

        <div className="relative px-10 py-8 flex justify-between items-start text-white">
          {/* Brand */}
          <div>
            <div className="text-3xl font-extrabold tracking-tight leading-none">
              <span style={{ color: '#fff' }}>{companyName.primary}</span>
              <span style={{ color: GOLD }}>{companyName.accent}</span>
              <span className="text-base font-light text-white/80">.shop</span>
            </div>
            <p className="text-xs text-white/70 mt-1 tracking-wide">{companySlogan}</p>
          </div>

          {/* Document Type */}
          <div className="text-left z-10">
            <h1 className="text-3xl font-extrabold uppercase tracking-wide" style={{ color: '#fff' }}>
              {documentType}
            </h1>
            {documentTypeLatin && (
              <p className="text-[11px] text-white/80 tracking-[0.25em] uppercase mt-0.5">
                {documentTypeLatin}
              </p>
            )}
            {documentId && (
              <p className="text-xs text-white/90 mt-2 font-mono">
                ID: <span className="font-bold">{documentId}</span>
              </p>
            )}
            {documentDate && (
              <p className="text-xs text-white/80 mt-0.5">{documentDate}</p>
            )}
          </div>
        </div>

        {/* Bottom golden line */}
        <div className="h-1.5" style={{ background: `linear-gradient(90deg, transparent, ${GOLD} 30%, ${GOLD} 70%, transparent)` }} />
      </div>

      {/* ============== BODY ============== */}
      <div className="px-10 py-8 space-y-6">
        {/* From / To Blocks */}
        {(toBlock || fromBlock) && (
          <div className="grid grid-cols-2 gap-6">
            {toBlock && (
              <div>
                <div
                  className="inline-block px-3 py-1 text-xs font-bold text-white"
                  style={{ background: NAVY }}
                >
                  {toBlock.title || 'إلى'}
                </div>
                <div className="mt-2 space-y-1 text-sm text-gray-700">
                  {toBlock.lines.map((line, i) => (
                    <div key={i}>{line}</div>
                  ))}
                </div>
              </div>
            )}
            {fromBlock && (
              <div className="text-left">
                <div
                  className="inline-block px-3 py-1 text-xs font-bold text-white"
                  style={{ background: NAVY }}
                >
                  {fromBlock.title || 'من'}
                </div>
                <div className="mt-2 space-y-1 text-sm text-gray-700">
                  {fromBlock.lines.map((line, i) => (
                    <div key={i}>{line}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Header Fields strip */}
        {headerFields && headerFields.length > 0 && (
          <div
            className="grid gap-3 p-4 rounded"
            style={{
              background: '#F8F9FB',
              borderRight: `4px solid ${GOLD}`,
              gridTemplateColumns: `repeat(${Math.min(headerFields.length, 4)}, minmax(0,1fr))`,
            }}
          >
            {headerFields.map((f, i) => (
              <div key={i}>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  {f.label}
                </p>
                <p className="text-sm font-semibold" style={{ color: NAVY }}>
                  {f.value}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Main content */}
        <div>{children}</div>

        {/* Summary card */}
        {summary && (
          <div className="flex justify-end">
            <div
              className="min-w-[280px] rounded-md overflow-hidden shadow-md"
              style={{ background: GOLD }}
            >
              <div className="px-5 py-4" style={{ color: NAVY }}>
                {summary}
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        {notes && (
          <div className="text-xs text-gray-600 border-t border-dashed pt-4 leading-relaxed">
            {notes}
          </div>
        )}

        {/* Stamp + QR */}
        {(showStamp || qrUrl) && (
          <div className="flex justify-between items-end pt-6">
            {qrUrl ? (
              <div className="text-center">
                <div className="p-2 bg-white border rounded">
                  <QRCodeSVG value={qrUrl} size={72} level="M" />
                </div>
                <p className="text-[10px] text-gray-500 mt-1">{qrLabel}</p>
              </div>
            ) : (
              <div />
            )}

            {showStamp && (
              <div className="text-center">
                <img
                  src={stampImg}
                  alt="UberFix Official Stamp"
                  className="w-24 h-24 object-contain opacity-90 mx-auto"
                  style={{ transform: 'rotate(-8deg)' }}
                />
                <p className="text-[10px] text-gray-500 mt-1">الختم الرسمي · UberFix</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ============== FOOTER ============== */}
      <div className="relative mt-6" style={{ background: NAVY }}>
        <div
          className="absolute bottom-0 left-0 h-full"
          style={{
            width: '38%',
            background: GOLD,
            clipPath: 'polygon(0 0, 80% 0, 100% 100%, 0 100%)',
          }}
        />
        <div
          className="absolute bottom-0 left-0 h-full"
          style={{
            width: '32%',
            background: NAVY,
            clipPath: 'polygon(0 0, 75% 0, 100% 100%, 0 100%)',
          }}
        />
        <div className="relative px-10 py-4 flex justify-between items-center text-white text-xs">
          <p className="opacity-90">
            © {new Date().getFullYear()} UberFix.shop — جميع الحقوق محفوظة
          </p>
          <p className="opacity-90 font-mono">uberfix.shop · +1 555 728 5727</p>
        </div>
      </div>
    </div>
  );
}

/** ------- Sub-components: جدول قياسي بهوية UberFix ------- */

export function DocTable({ children }: { children: ReactNode }) {
  return (
    <table className="w-full text-sm border-collapse">
      {children}
    </table>
  );
}

export function DocTableHead({ columns }: { columns: string[] }) {
  return (
    <thead>
      <tr style={{ background: GOLD, color: NAVY }}>
        {columns.map((c, i) => (
          <th
            key={i}
            className="text-right px-4 py-3 text-xs font-extrabold uppercase tracking-wide border-l border-white/30 last:border-l-0"
          >
            {c}
          </th>
        ))}
      </tr>
    </thead>
  );
}

export default DocumentTemplate;
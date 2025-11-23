interface AppFooterProps {
  className?: string;
}

export function AppFooter({ className = "" }: AppFooterProps) {
  return (
    <footer className={`mt-8 text-center text-xs text-muted-foreground ${className}`}>
      <div className="space-x-4 space-x-reverse">
        <a href="#" className="hover:text-primary transition-colors">دليل المستخدم</a>
        <span>•</span>
        <a href="#" className="hover:text-primary transition-colors">شروط الاستخدام</a>
        <span>•</span>
        <a href="#" className="hover:text-primary transition-colors">سياسة الخصوصية</a>
      </div>
      <div className="mt-2">
        جميع الحقوق محفوظة © 2025 بواسطة UberFix.shop - v2.0.0
      </div>
    </footer>
  );
}

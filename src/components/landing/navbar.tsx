import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink-100/70 bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Logo />
        <nav className="hidden items-center gap-8 md:flex">
          <Link href="#how" className="text-sm font-medium text-ink-600 hover:text-ink-900">
            كيف تعمل
          </Link>
          <Link href="#types" className="text-sm font-medium text-ink-600 hover:text-ink-900">
            الأنشطة المدعومة
          </Link>
          <Link href="#templates" className="text-sm font-medium text-ink-600 hover:text-ink-900">
            القوالب
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              تسجيل الدخول
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">ابدأ مجانًا</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

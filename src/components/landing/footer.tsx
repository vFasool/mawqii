import { Logo } from "@/components/ui/logo";

export function Footer() {
  return (
    <footer className="border-t border-ink-100 bg-paper py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row">
        <Logo />
        <p className="text-sm text-ink-400">© {new Date().getFullYear()} موقعي. جميع الحقوق محفوظة.</p>
      </div>
    </footer>
  );
}

import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper-dim px-4 text-center">
      <Logo className="mb-8" />
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
        <Compass className="h-8 w-8 text-amber-600" aria-hidden />
      </div>
      <h1 className="mt-6 font-display text-3xl font-bold text-ink-800">الصفحة غير موجودة</h1>
      <p className="mt-2 max-w-sm text-ink-500">
        الرابط الذي وصلت إليه غير صحيح أو أن الصفحة لم تعد متاحة.
      </p>
      <Link href="/" className="mt-7">
        <Button>العودة إلى الصفحة الرئيسية</Button>
      </Link>
    </div>
  );
}

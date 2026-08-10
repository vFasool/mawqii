"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // في بيئة إنتاج حقيقية: أرسل هذا لخدمة مراقبة الأخطاء (Sentry، إلخ).
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper-dim px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
        <AlertTriangle className="h-8 w-8 text-red-500" aria-hidden />
      </div>
      <h1 className="mt-6 font-display text-2xl font-bold text-ink-800">حدث خطأ غير متوقع</h1>
      <p className="mt-2 max-w-sm text-ink-500">
        نعتذر عن الإزعاج. حاول مرة أخرى، وإن استمرت المشكلة تواصل معنا.
      </p>
      <Button onClick={reset} className="mt-7">
        إعادة المحاولة
      </Button>
    </div>
  );
}

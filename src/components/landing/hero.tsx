import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-paper">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-14 md:grid-cols-2 md:pt-24">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            مبني خصيصًا لأصحاب الأنشطة المحلية
          </span>
          <h1 className="mt-5 font-display text-4xl font-bold leading-[1.15] text-ink-900 md:text-5xl">
            من بيانات نشاطك،
            <br />
            إلى موقع احترافي جاهز.
          </h1>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-ink-500">
            أدخل اسم نشاطك وخدماتك وساعات عملك، ودع "موقعي" يبني لك موقعًا
            جاهزًا للنشر خلال دقائق — بدون أي خبرة تقنية.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link href="/signup">
              <Button size="lg">
                ابدأ موقعك الآن
                <ArrowLeft className="h-4 w-4" aria-hidden />
              </Button>
            </Link>
            <Link href="#how">
              <Button variant="outline" size="lg">
                شاهد كيف تعمل
              </Button>
            </Link>
          </div>
        </div>

        {/* العنصر المميز: تحويل مباشر من "بطاقة بيانات" إلى "موقع" */}
        <div className="relative">
          <div className="flex items-center gap-3 rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
            <DataCard />
            <div className="hidden shrink-0 flex-col items-center gap-1 text-ink-300 sm:flex">
              <ArrowLeft className="h-5 w-5" aria-hidden />
              <span className="text-[10px] font-medium">خلال دقائق</span>
            </div>
            <SitePreviewCard />
          </div>
        </div>
      </div>
    </section>
  );
}

function DataCard() {
  const rows = [
    ["اسم النشاط", "مقهى أُريج"],
    ["النوع", "كافيه"],
    ["المدينة", "الرياض"],
    ["واتساب", "05xxxxxxxx"],
  ];
  return (
    <div className="hidden w-40 shrink-0 rounded-xl border border-ink-100 bg-paper-dim p-3 sm:block">
      <p className="mb-2 text-[10px] font-semibold text-ink-400">بياناتك</p>
      <dl className="space-y-2">
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt className="text-[9px] text-ink-400">{label}</dt>
            <dd className="truncate text-[11px] font-medium text-ink-700">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function SitePreviewCard() {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-ink-100">
      <div className="flex items-center gap-1.5 bg-ink-100 px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-ink-300" />
        <span className="h-2 w-2 rounded-full bg-ink-300" />
        <span className="h-2 w-2 rounded-full bg-ink-300" />
      </div>
      <div className="bg-emerald-700 px-4 py-6 text-center">
        <p className="font-display text-lg font-bold text-paper">مقهى أُريج</p>
        <p className="mt-1 text-xs text-emerald-100">قهوة مختصة في قلب الرياض</p>
      </div>
      <div className="grid grid-cols-2 gap-2 bg-white p-3">
        {["لاتيه", "إسبريسو", "كولد برو", "حلويات"].map((item) => (
          <div key={item} className="rounded-lg bg-paper-dim px-2 py-3 text-center">
            <span className="text-[11px] font-medium text-ink-600">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

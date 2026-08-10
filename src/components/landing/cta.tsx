import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Cta() {
  return (
    <section className="bg-emerald-800 py-16">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <h2 className="font-display text-3xl font-bold text-paper">
          موقعك التجاري بانتظارك
        </h2>
        <p className="mx-auto mt-3 max-w-md text-emerald-100">
          انضم لأصحاب الأنشطة الذين بنوا حضورهم الإلكتروني بدقائق، بدون تعقيد.
        </p>
        <Link href="/signup" className="mt-7 inline-block">
          <Button variant="secondary" size="lg">
            أنشئ حسابك المجاني
          </Button>
        </Link>
      </div>
    </section>
  );
}

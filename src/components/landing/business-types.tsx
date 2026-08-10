import { UtensilsCrossed, Coffee, Scissors, Car, Wrench } from "lucide-react";

const types = [
  { icon: UtensilsCrossed, label: "مطاعم" },
  { icon: Coffee, label: "كافيهات" },
  { icon: Scissors, label: "صالونات حلاقة" },
  { icon: Car, label: "مغاسل سيارات" },
  { icon: Wrench, label: "خدمات منزلية" },
];

export function BusinessTypes() {
  return (
    <section id="types" className="border-y border-ink-100 bg-paper-dim py-16">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center font-display text-2xl font-bold text-ink-800">
          مصمّم لأنشطتك، بلغتك
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-ink-500">
          كل نوع نشاط له قالب وأقسام مصمّمة خصيصًا له — من قائمة الطعام إلى حجز موعد الحلاقة.
        </p>
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          {types.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-3 rounded-xl2 bg-white p-6 text-center shadow-card"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
                <Icon className="h-6 w-6 text-emerald-700" aria-hidden />
              </div>
              <span className="text-sm font-semibold text-ink-700">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

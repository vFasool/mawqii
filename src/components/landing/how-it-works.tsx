const steps = [
  {
    n: "01",
    title: "أدخل بيانات نشاطك",
    desc: "اسم النشاط، الخدمات، الأسعار، ساعات العمل، ووسائل التواصل — خطوة بخطوة.",
  },
  {
    n: "02",
    title: "اختر قالبك وخصّصه",
    desc: "اختر من 5 قوالب مصممة لنوع نشاطك، وعدّل الألوان والخط وترتيب الأقسام.",
  },
  {
    n: "03",
    title: "انشر موقعك",
    desc: "احصل على رابط عام فريد لموقعك جاهز للمشاركة على واتساب وانستقرام.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="py-20">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center font-display text-2xl font-bold text-ink-800">
          ثلاث خطوات، وموقعك جاهز
        </h2>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.n} className="relative rounded-xl2 border border-ink-100 bg-white p-6">
              <span className="font-display text-4xl font-bold text-emerald-100">{step.n}</span>
              <h3 className="mt-2 font-display text-lg font-bold text-ink-800">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

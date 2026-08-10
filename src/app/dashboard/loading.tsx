export default function DashboardLoading() {
  return (
    <div className="animate-pulse">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="h-7 w-40 rounded bg-ink-100" />
          <div className="mt-2 h-4 w-64 rounded bg-ink-100" />
        </div>
        <div className="h-11 w-40 rounded-xl2 bg-ink-100" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-xl2 border border-ink-100 bg-white p-5">
            <div className="h-4 w-32 rounded bg-ink-100" />
            <div className="mt-2 h-3 w-20 rounded bg-ink-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

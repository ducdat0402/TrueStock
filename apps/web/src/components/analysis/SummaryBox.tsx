interface SummaryBoxProps {
  summary: string;
}

export function SummaryBox({ summary }: SummaryBoxProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-teal/20 bg-gradient-to-br from-teal/8 via-white to-navy/5 p-4 shadow-sm sm:p-6">
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-teal/10 blur-2xl" />
      <div className="relative flex gap-3">
        <span className="shrink-0 text-xl sm:text-2xl">📋</span>
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-navy sm:text-lg">Tóm tắt</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-700 sm:mt-3 sm:text-base">
            {summary}
          </p>
        </div>
      </div>
    </section>
  );
}

export function AnalysisDisclaimer() {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-center sm:px-4">
      <p className="text-xs leading-relaxed text-slate-500">
        ⚠️ Thông tin tham khảo, không phải tư vấn đầu tư
      </p>
    </div>
  );
}

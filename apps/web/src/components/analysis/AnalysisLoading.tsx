interface AnalysisLoadingProps {
  ticker: string;
}

const STEPS = [
  "Lấy dữ liệu tài chính",
  "Claude AI đang phân tích",
  "Viết giải thích tiếng Việt",
] as const;

export function AnalysisLoading({ ticker }: AnalysisLoadingProps) {
  return (
    <div className="flex flex-col items-center gap-6 py-8 sm:gap-8 sm:py-12 md:py-16">
      <div className="card w-full max-w-md p-5 text-center sm:p-8">
        <div className="relative mx-auto h-16 w-16 sm:h-20 sm:w-20">
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-slate-100 border-t-teal" />
          <div className="absolute inset-3 flex items-center justify-center rounded-full bg-navy/5 text-base font-bold text-navy sm:text-lg">
            {ticker.toUpperCase().slice(0, 3)}
          </div>
        </div>

        <p className="mt-5 text-lg font-bold text-navy sm:mt-6 sm:text-xl">
          Đang phân tích {ticker.toUpperCase()}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          AI đang đọc báo cáo tài chính và viết phân tích dễ hiểu.
          <span className="mt-1 block sm:mt-0 sm:inline">
            {" "}
            Thường mất <strong className="text-navy">20–40 giây</strong> lần đầu.
          </span>
        </p>

        <ul className="mt-6 space-y-2.5 text-left text-sm sm:mt-8 sm:space-y-3">
          {STEPS.map((step, i) => (
            <li
              key={step}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
                i === 1 ? "bg-teal/5 text-teal-dark" : "text-slate-500"
              }`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  i === 0
                    ? "bg-green-100 text-green-700"
                    : i === 1
                      ? "animate-pulse-soft bg-teal text-white"
                      : "bg-slate-100 text-slate-400"
                }`}
              >
                {i === 0 ? "✓" : i + 1}
              </span>
              <span className="min-w-0 flex-1">{step}</span>
              {i === 1 && (
                <span className="shrink-0 text-xs animate-pulse-soft">...</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

import type { IndustryComparison } from "@truestock/types";

interface IndustryComparisonBoxProps {
  comparison: IndustryComparison;
}

export function IndustryComparisonBox({
  comparison,
}: IndustryComparisonBoxProps) {
  const { industryName, industryAvgScore, delta, peerCount, verdict } = comparison;

  const deltaColor =
    delta >= 0.5
      ? "text-green-600"
      : delta <= -0.5
        ? "text-red-600"
        : "text-slate-600";

  const deltaSign = delta > 0 ? "+" : "";
  const bgGradient =
    delta >= 0.5
      ? "from-green-50 to-green-50/30"
      : delta <= -0.5
        ? "from-red-50 to-red-50/30"
        : "from-slate-50 to-white";

  const borderColor =
    delta >= 0.5
      ? "border-green-200"
      : delta <= -0.5
        ? "border-red-200"
        : "border-slate-200";

  return (
    <section
      className={`rounded-2xl border bg-gradient-to-r p-4 sm:p-5 ${borderColor} ${bgGradient}`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
            📊
          </span>
          <div>
            <h3 className="font-semibold text-navy">So sánh với ngành</h3>
            <p className="text-sm text-slate-500">
              {industryName} ({peerCount} công ty cùng ngành)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <div className="text-center">
            <p className="text-xs text-slate-500">Trung bình ngành</p>
            <p className="text-2xl font-bold text-slate-700">
              {industryAvgScore}
              <span className="text-sm font-normal text-slate-400">/10</span>
            </p>
          </div>

          <div className="text-center">
            <p className="text-xs text-slate-500">So sánh</p>
            <p className={`text-2xl font-bold ${deltaColor}`}>
              {deltaSign}
              {delta}
            </p>
          </div>
        </div>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-slate-700">{verdict}</p>
    </section>
  );
}

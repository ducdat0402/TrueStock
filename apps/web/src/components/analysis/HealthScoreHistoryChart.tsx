import type { HealthScoreHistoryItem } from "@truestock/types";

interface HealthScoreHistoryChartProps {
  history: HealthScoreHistoryItem[];
}

function getScoreColor(score: number): string {
  if (score >= 7) return "#10b981"; // green
  if (score >= 5) return "#f59e0b"; // amber
  return "#ef4444"; // red
}

function getTrendInfo(history: HealthScoreHistoryItem[]): {
  label: string;
  color: string;
  icon: string;
} {
  if (history.length < 2) {
    return { label: "Chưa đủ dữ liệu", color: "text-slate-500", icon: "—" };
  }

  const first = history[0].score;
  const last = history[history.length - 1].score;
  const diff = last - first;

  if (diff > 0.5) {
    return {
      label: "Đang cải thiện",
      color: "text-green-600",
      icon: "↗",
    };
  } else if (diff < -0.5) {
    return {
      label: "Đang giảm",
      color: "text-red-600",
      icon: "↘",
    };
  }
  return {
    label: "Ổn định",
    color: "text-slate-600",
    icon: "→",
  };
}

export function HealthScoreHistoryChart({
  history,
}: HealthScoreHistoryChartProps) {
  if (history.length === 0) return null;

  const maxScore = 10;
  const chartHeight = 120;
  const barWidth = 100 / history.length - 4; // percentage width with gaps

  const trend = getTrendInfo(history);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-50 to-teal-100 text-xl">
            📈
          </span>
          <div>
            <h3 className="font-semibold text-navy">Lịch sử điểm sức khỏe</h3>
            <p className="text-sm text-slate-500">
              {history.length} quý gần nhất
            </p>
          </div>
        </div>

        <div
          className={`flex items-center gap-1.5 text-sm font-medium ${trend.color}`}
        >
          <span className="text-lg">{trend.icon}</span>
          <span>{trend.label}</span>
        </div>
      </div>

      {/* Bar chart */}
      <div className="relative mt-2" style={{ height: chartHeight + 40 }}>
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 flex h-full flex-col justify-between pb-8 pr-2 text-xs text-slate-400">
          <span>10</span>
          <span>5</span>
          <span>0</span>
        </div>

        {/* Bars container */}
        <div className="ml-6 flex h-full items-end justify-around gap-1 pb-8">
          {history.map((item) => {
            const barHeight = (item.score / maxScore) * chartHeight;
            const color = getScoreColor(item.score);

            return (
              <div
                key={item.period}
                className="flex flex-col items-center"
                style={{ width: `${barWidth}%` }}
              >
                {/* Score label above bar */}
                <span
                  className="mb-1 text-xs font-semibold"
                  style={{ color }}
                >
                  {item.score}
                </span>

                {/* Bar */}
                <div
                  className="w-full rounded-t-lg transition-all duration-300"
                  style={{
                    height: barHeight,
                    backgroundColor: color,
                    minWidth: 32,
                    maxWidth: 60,
                  }}
                />

                {/* Period label */}
                <span className="mt-2 text-xs text-slate-500">
                  {item.period}
                </span>
              </div>
            );
          })}
        </div>

        {/* Horizontal grid lines */}
        <div className="absolute inset-x-6 top-0 pointer-events-none" style={{ height: chartHeight }}>
          <div className="absolute top-0 h-px w-full bg-slate-100" />
          <div className="absolute top-1/2 h-px w-full bg-slate-100" />
          <div className="absolute bottom-0 h-px w-full bg-slate-200" />
        </div>
      </div>
    </section>
  );
}

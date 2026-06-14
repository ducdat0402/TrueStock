import type { AnalysisResult } from "@truestock/types";
import { getScoreVerdict, ScoreBadge } from "../ui/ScoreBadge";
import { getColorClasses, getHealthScoreColor } from "./utils";

interface HealthScoreCircleProps {
  score: number;
}

export function HealthScoreCircle({ score }: HealthScoreCircleProps) {
  const color = getHealthScoreColor(score);
  const colors = getColorClasses(color);
  const percentage = (score / 10) * 100;
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const verdict = getScoreVerdict(score);

  return (
    <div className="flex flex-col items-center px-2">
      <div className="relative">
        <div
          className={`absolute inset-0 m-auto h-36 w-36 rounded-full blur-2xl sm:h-40 sm:w-40 md:h-48 md:w-48 ${colors.bg} opacity-40`}
        />
        <div className="relative h-32 w-32 sm:h-36 sm:w-36 md:h-44 md:w-44">
          <svg className="h-full w-full -rotate-90 drop-shadow-sm" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-slate-100"
            />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className={`${colors.ring} transition-all duration-1000 ease-out`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-extrabold text-navy sm:text-4xl md:text-5xl">
              {score}
            </span>
            <span className="text-xs text-slate-400 sm:text-sm">/ 10</span>
          </div>
        </div>
      </div>

      <p className="mt-3 text-center text-sm font-medium text-slate-600 sm:mt-4">
        Điểm sức khỏe tài chính
      </p>
      <span
        className={`mt-2 rounded-full px-3 py-1 text-xs font-semibold sm:text-sm ${colors.bg} ${colors.text}`}
      >
        {verdict}
      </span>
    </div>
  );
}

interface AnalysisHeaderProps {
  result: AnalysisResult;
}

export function AnalysisHeader({ result }: AnalysisHeaderProps) {
  const analyzedAt = new Date(result.analyzedAt).toLocaleString("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  });

  return (
    <div className="px-1 text-center">
      <div className="inline-flex max-w-full flex-wrap items-center justify-center gap-2 rounded-full border border-navy/10 bg-navy/5 px-3 py-1.5 sm:px-4">
        <span className="text-sm font-bold tracking-wide text-navy">
          {result.ticker}
        </span>
        <ScoreBadge score={result.healthScore} />
      </div>
      <h1 className="mt-3 break-words text-xl font-bold leading-snug text-navy sm:mt-4 sm:text-2xl md:text-3xl">
        {result.companyName}
      </h1>
      <p className="mt-2 text-xs leading-relaxed text-slate-500 sm:text-sm">
        <span className="block sm:inline">Nguồn: {result.dataSource}</span>
        <span className="hidden sm:inline"> · </span>
        <span className="mt-0.5 block sm:mt-0 sm:inline">{analyzedAt}</span>
      </p>
    </div>
  );
}

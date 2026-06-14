import type { PlainAnswers, SubScore, SubScores } from "@truestock/types";
import { getColorClasses, truncateText } from "./utils";

const SUB_SCORE_ICONS: Record<keyof SubScores, string> = {
  profitability: "💰",
  safety: "🛡️",
  growth: "📈",
  valuation: "🏷️",
};

interface SubScoreCardProps {
  title: string;
  subScore: SubScore;
  explanation: string;
  icon: string;
}

function SubScoreCard({ title, subScore, explanation, icon }: SubScoreCardProps) {
  const colors = getColorClasses(subScore.color);
  const barWidth = `${subScore.score * 10}%`;

  return (
    <div className={`card card-hover border-t-4 p-4 sm:p-5 ${colors.border}`}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-center gap-2">
          <span className="text-lg">{icon}</span>
          <h3 className="font-semibold text-navy">{title}</h3>
        </div>
        <span
          className={`w-fit shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${colors.bg} ${colors.text}`}
        >
          {subScore.label}
        </span>
      </div>

      <div className="mt-3 flex items-end gap-2 sm:mt-4">
        <span className="text-2xl font-bold text-navy sm:text-3xl">{subScore.score}</span>
        <span className="mb-0.5 text-sm text-slate-400 sm:mb-1">/10</span>
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all duration-700 ${colors.dot}`}
          style={{ width: barWidth }}
        />
      </div>

      <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:mt-4">
        {truncateText(explanation, 140)}
      </p>
    </div>
  );
}

const SUB_SCORE_CONFIG: {
  key: keyof SubScores;
  title: string;
  answerKey: keyof PlainAnswers;
}[] = [
  { key: "profitability", title: "Khả năng sinh lời", answerKey: "isProfitable" },
  { key: "safety", title: "An toàn tài chính", answerKey: "isDebtSafe" },
  { key: "growth", title: "Tăng trưởng", answerKey: "isGrowing" },
  { key: "valuation", title: "Định giá", answerKey: "isPriceReasonable" },
];

interface SubScoreGridProps {
  subScores: SubScores;
  plainAnswers: PlainAnswers;
}

export function SubScoreGrid({ subScores, plainAnswers }: SubScoreGridProps) {
  return (
    <section>
      <h2 className="mb-3 text-base font-semibold text-navy sm:mb-4 sm:text-lg">
        4 tiêu chí đánh giá
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
        {SUB_SCORE_CONFIG.map(({ key, title, answerKey }) => (
          <SubScoreCard
            key={key}
            title={title}
            subScore={subScores[key]}
            explanation={plainAnswers[answerKey]}
            icon={SUB_SCORE_ICONS[key]}
          />
        ))}
      </div>
    </section>
  );
}

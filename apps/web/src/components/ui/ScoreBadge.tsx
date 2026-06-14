interface ScoreBadgeProps {
  score: number;
  size?: "sm" | "md";
}

export function ScoreBadge({ score, size = "sm" }: ScoreBadgeProps) {
  const color =
    score >= 7.5
      ? "bg-green-100 text-green-700 ring-green-200"
      : score >= 5
        ? "bg-yellow-100 text-yellow-700 ring-yellow-200"
        : "bg-red-100 text-red-700 ring-red-200";

  const sizeClass =
    size === "md" ? "px-3 py-1 text-sm" : "px-2.5 py-0.5 text-xs";

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold ring-1 ring-inset ${color} ${sizeClass}`}
    >
      {score}/10
    </span>
  );
}

export function getScoreVerdict(score: number): string {
  if (score >= 8) return "Rất tốt";
  if (score >= 7) return "Tốt";
  if (score >= 5) return "Trung bình";
  return "Cần cẩn trọng";
}

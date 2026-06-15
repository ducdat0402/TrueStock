import type { SubScore } from "@truestock/types";

export function getColorClasses(color: SubScore["color"]) {
  const map = {
    green: {
      bg: "bg-green-100",
      text: "text-green-700",
      border: "border-green-200",
      dot: "bg-green-500",
      ring: "stroke-green-500",
    },
    yellow: {
      bg: "bg-yellow-100",
      text: "text-yellow-700",
      border: "border-yellow-200",
      dot: "bg-yellow-500",
      ring: "stroke-yellow-500",
    },
    red: {
      bg: "bg-red-100",
      text: "text-red-700",
      border: "border-red-200",
      dot: "bg-red-500",
      ring: "stroke-red-500",
    },
  };
  return map[color];
}

export function getHealthScoreColor(score: number): SubScore["color"] {
  if (score >= 7.5) return "green";
  if (score >= 5) return "yellow";
  return "red";
}

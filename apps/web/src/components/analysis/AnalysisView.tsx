import type { AnalysisResult } from "@truestock/types";
import { AnalysisHeader, HealthScoreCircle } from "./HealthScoreCircle";
import { QuestionAccordion } from "./QuestionAccordion";
import { SubScoreGrid } from "./SubScoreGrid";
import { AnalysisDisclaimer, SummaryBox } from "./SummaryBox";

interface AnalysisViewProps {
  result: AnalysisResult;
}

export function AnalysisView({ result }: AnalysisViewProps) {
  return (
    <div className="space-y-6 sm:space-y-8">
      <AnalysisHeader result={result} />

      <div className="flex justify-center py-2 sm:py-4">
        <HealthScoreCircle score={result.healthScore} />
      </div>

      <SubScoreGrid
        subScores={result.subScores}
        plainAnswers={result.plainAnswers}
      />

      <QuestionAccordion plainAnswers={result.plainAnswers} />

      <SummaryBox summary={result.summary} />

      <AnalysisDisclaimer />
    </div>
  );
}

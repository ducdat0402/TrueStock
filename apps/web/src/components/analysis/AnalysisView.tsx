import type { AnalysisResult } from "@truestock/types";
import { AnalysisHeader, HealthScoreCircle } from "./HealthScoreCircle";
import { HealthScoreHistoryChart } from "./HealthScoreHistoryChart";
import { IndustryComparisonBox } from "./IndustryComparisonBox";
import { QuestionAccordion } from "./QuestionAccordion";
import { RiskAlertsBox } from "./RiskAlertsBox";
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

      {result.healthScoreHistory && result.healthScoreHistory.length > 0 && (
        <HealthScoreHistoryChart history={result.healthScoreHistory} />
      )}

      {result.industryComparison && (
        <IndustryComparisonBox comparison={result.industryComparison} />
      )}

      {result.riskAlerts && result.riskAlerts.length > 0 && (
        <RiskAlertsBox alerts={result.riskAlerts} />
      )}

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

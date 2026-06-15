import type { RiskAlert } from "@truestock/types";

interface RiskAlertsBoxProps {
  alerts: RiskAlert[];
}

export function RiskAlertsBox({ alerts }: RiskAlertsBoxProps) {
  if (alerts.length === 0) return null;

  const warnings = alerts.filter((a) => a.level === "warning");
  const infos = alerts.filter((a) => a.level === "info");

  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold text-navy sm:text-lg">
        Lưu ý rủi ro
      </h2>

      <div className="space-y-2">
        {warnings.map((alert, i) => (
          <div
            key={`warning-${i}`}
            className="flex items-start gap-3 rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-amber-50/50 p-3 sm:p-4"
          >
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm">
              ⚠️
            </span>
            <p className="text-sm leading-relaxed text-amber-900">
              {alert.message}
            </p>
          </div>
        ))}

        {infos.map((alert, i) => (
          <div
            key={`info-${i}`}
            className="flex items-start gap-3 rounded-xl border border-slate-200 bg-gradient-to-r from-slate-50 to-white p-3 sm:p-4"
          >
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm">
              ℹ️
            </span>
            <p className="text-sm leading-relaxed text-slate-700">
              {alert.message}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

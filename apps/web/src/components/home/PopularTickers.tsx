import { useNavigate } from "react-router-dom";

const POPULAR_TICKERS = [
  "FPT",
  "VNM",
  "HPG",
  "VIC",
  "TCB",
  "VCB",
  "MWG",
  "HPG",
] as const;

const UNIQUE_TICKERS = [...new Set(POPULAR_TICKERS)];

interface PopularTickersProps {
  variant?: "hero" | "default";
}

export function PopularTickers({ variant = "default" }: PopularTickersProps) {
  const navigate = useNavigate();
  const isHero = variant === "hero";

  return (
    <div className="flex flex-col items-center gap-2.5 sm:gap-3">
      <p
        className={`text-xs sm:text-sm ${
          isHero ? "text-white/60" : "text-slate-500"
        }`}
      >
        Thử nhanh:
      </p>
      <div className="flex max-w-full flex-wrap justify-center gap-1.5 sm:gap-2">
        {UNIQUE_TICKERS.map((code) => (
          <button
            key={code}
            type="button"
            onClick={() => navigate(`/analyze/${code}`)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition sm:px-4 sm:py-1.5 sm:text-sm ${
              isHero
                ? "border border-white/20 bg-white/10 text-white hover:border-teal-light hover:bg-teal/30"
                : "border border-slate-200 bg-white text-navy hover:border-teal hover:text-teal"
            }`}
          >
            {code}
          </button>
        ))}
      </div>
    </div>
  );
}

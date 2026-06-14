import { useState } from "react";
import { useNavigate } from "react-router-dom";

const TICKER_REGEX = /^[A-Za-z0-9]{1,10}$/;

interface SearchBoxProps {
  variant?: "hero" | "default";
}

export function SearchBox({ variant = "default" }: SearchBoxProps) {
  const [ticker, setTicker] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const isHero = variant === "hero";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = ticker.trim().toUpperCase();

    if (!trimmed) {
      setError("Vui lòng nhập mã cổ phiếu");
      return;
    }

    if (!TICKER_REGEX.test(trimmed)) {
      setError("Mã cổ phiếu không hợp lệ (chỉ chữ và số, tối đa 10 ký tự)");
      return;
    }

    setError(null);
    navigate(`/analyze/${trimmed}`);
  };

  return (
    <div className="w-full">
      <form
        onSubmit={handleSubmit}
        className={`flex w-full flex-col gap-2.5 sm:flex-row sm:gap-3 ${
          isHero ? "mx-auto max-w-xl" : "max-w-lg"
        }`}
      >
        <input
          type="text"
          value={ticker}
          onChange={(e) => {
            setTicker(e.target.value.toUpperCase());
            setError(null);
          }}
          placeholder="Nhập mã (VD: FPT, VNM)"
          className={`min-w-0 flex-1 rounded-xl border px-4 py-3 text-base uppercase shadow-sm outline-none transition focus:ring-2 sm:py-3.5 sm:text-lg ${
            isHero
              ? "border-white/20 bg-white/10 text-white placeholder:text-white/50 focus:border-teal-light focus:ring-teal/30"
              : "border-slate-300 bg-white text-navy focus:border-teal focus:ring-teal/20"
          }`}
          aria-label="Mã cổ phiếu"
        />
        <button
          type="submit"
          disabled={!ticker.trim()}
          className={`w-full rounded-xl px-6 py-3 text-base font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-8 sm:py-3.5 sm:text-lg ${
            isHero
              ? "bg-teal text-white hover:bg-teal-light"
              : "bg-teal text-white hover:bg-teal-light"
          }`}
        >
          Phân tích
        </button>
      </form>

      {error && (
        <p
          className={`mt-2 text-left text-sm ${
            isHero ? "text-red-300" : "text-red-600"
          }`}
        >
          {error}
        </p>
      )}
    </div>
  );
}

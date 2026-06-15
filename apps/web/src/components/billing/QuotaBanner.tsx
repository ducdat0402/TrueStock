import { Link } from "react-router-dom";
import { useAuth } from "@clerk/react";
import { useMe } from "../../hooks/useMe";

export function QuotaBanner() {
  const { isSignedIn, isLoaded } = useAuth();
  const { data, loading } = useMe();

  if (!isLoaded || !isSignedIn || loading || !data || data.plan !== "free") {
    return null;
  }

  const { usage } = data;
  const used = typeof usage.analyze.used === "number" ? usage.analyze.used : 0;
  const limit =
    typeof usage.analyze.limit === "number" ? usage.analyze.limit : 3;
  const remaining =
    typeof usage.analyze.remaining === "number" ? usage.analyze.remaining : limit - used;

  const isExhausted = remaining === 0;
  const isLow = remaining <= 1;

  return (
    <div
      className={`rounded-xl border px-4 py-3 ${
        isExhausted
          ? "border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50"
          : isLow
            ? "border-teal/30 bg-gradient-to-r from-teal/10 to-teal/5"
            : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <span className="text-xl leading-none">
            {isExhausted ? "⚡" : isLow ? "💡" : "📊"}
          </span>
          <div>
            <p className="text-sm font-semibold text-navy">
              Gói miễn phí · Đã dùng {used}/{limit} lượt phân tích hôm nay
            </p>
            <p className="mt-0.5 text-xs text-slate-600">
              {isExhausted
                ? "Bạn đã hết lượt phân tích mới hôm nay. Nâng cấp Premium để không giới hạn."
                : used === 0
                  ? "Mã đã có trong cache 24h không tính quota — chỉ mã mới mới trừ lượt."
                  : `Còn ${remaining} lượt. Mã đã phân tích trong 24h không tính thêm.`}
            </p>
          </div>
        </div>
        <Link
          to="/pricing"
          className={`shrink-0 rounded-lg px-4 py-2 text-xs font-semibold transition ${
            isExhausted || isLow
              ? "bg-gradient-to-r from-teal to-teal-dark text-white hover:shadow-md"
              : "border border-teal/30 bg-white text-teal hover:bg-teal/5"
          }`}
        >
          {isExhausted ? "Nâng cấp Premium" : "Xem bảng giá"}
        </Link>
      </div>
    </div>
  );
}

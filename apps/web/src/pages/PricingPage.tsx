import { SignInButton, useAuth } from "@clerk/react";
import { Link } from "react-router-dom";
import { PremiumCheckoutButton } from "../components/billing/PremiumCheckoutButton";
import { useMe } from "../hooks/useMe";

const FEATURES = {
  free: [
    "3 phân tích cổ phiếu/ngày",
    "Điểm sức khỏe tài chính",
    "Tóm tắt AI dễ hiểu",
    "Nguồn dữ liệu CafeF",
  ],
  premium: [
    "Phân tích không giới hạn",
    "So sánh tối đa 5 mã cùng lúc",
    "Cảnh báo biến động (Email + App)",
    "Theo dõi danh mục đầu tư",
    "Phân tích ngành & đối thủ",
    "Biểu đồ sức khỏe theo quý",
    "Cảnh báo rủi ro tự động",
    "Upload PDF BCTC",
  ],
};

const upgradeButtonClass =
  "mt-4 w-full rounded-xl bg-gradient-to-r from-teal to-teal-dark px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60";

export function PricingPage() {
  const { isSignedIn } = useAuth();
  const { data: me, loading } = useMe();
  const isPremium = me?.plan === "premium" || me?.plan === "b2b";

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-navy sm:text-3xl">
          Chọn gói phù hợp với bạn
        </h1>
        <p className="mt-2 text-slate-600">
          Nâng cấp Premium để mở khóa toàn bộ tính năng phân tích cổ phiếu
        </p>
        {isSignedIn && !loading && me && (
          <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-1.5 text-sm text-slate-700">
            Gói hiện tại:
            <span
              className={`font-semibold ${isPremium ? "text-teal" : "text-navy"}`}
            >
              {isPremium ? "Premium" : "Miễn phí"}
            </span>
            {!isPremium &&
              typeof me.usage.analyze.used === "number" &&
              typeof me.usage.analyze.limit === "number" && (
                <span className="text-slate-500">
                  · Đã dùng {me.usage.analyze.used}/{me.usage.analyze.limit} lượt
                  hôm nay
                </span>
              )}
          </p>
        )}
      </div>

      {/* Feature comparison */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="card flex flex-col border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-navy">Miễn phí</h2>
          <p className="mt-1 text-2xl font-bold text-navy">0đ/tháng</p>
          <ul className="mt-4 flex-1 space-y-2">
            {FEATURES.free.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm">
                <span className="text-teal">✓</span>
                <span className="text-slate-700">{feature}</span>
              </li>
            ))}
          </ul>
          {!isPremium && isSignedIn && (
            <div className="mt-4 rounded-xl bg-slate-100 px-4 py-2 text-center text-sm font-medium text-slate-600">
              Gói hiện tại
            </div>
          )}
        </div>

        <div className="card flex flex-col border-2 border-teal bg-gradient-to-b from-teal/5 to-white p-6">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-navy">Premium</h2>
            <span className="rounded-full bg-teal px-2 py-0.5 text-[10px] font-bold uppercase text-white">
              Phổ biến
            </span>
          </div>
          <p className="mt-1 text-2xl font-bold text-navy">~129.000đ/tháng</p>
          <p className="text-xs text-slate-500">Thanh toán qua Stripe (Visa/Mastercard)</p>
          <ul className="mt-4 flex-1 space-y-2">
            {FEATURES.premium.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm">
                <span className="text-teal">✓</span>
                <span className="text-slate-700">{feature}</span>
              </li>
            ))}
          </ul>
          {isPremium ? (
            <div className="mt-4 rounded-xl bg-teal/10 px-4 py-2 text-center text-sm font-medium text-teal">
              Bạn đang dùng Premium
            </div>
          ) : isSignedIn ? (
            <PremiumCheckoutButton className={upgradeButtonClass}>
              Nâng cấp Premium
            </PremiumCheckoutButton>
          ) : (
            <SignInButton mode="modal">
              <button type="button" className={upgradeButtonClass}>
                Đăng nhập để nâng cấp
              </button>
            </SignInButton>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-navy">
          Câu hỏi thường gặp
        </h3>
        <div className="space-y-4 text-sm text-slate-600">
          <div>
            <p className="font-medium text-navy">
              3 lượt phân tích/ngày tính như thế nào?
            </p>
            <p className="mt-1">
              Chỉ mã mới (cache miss) mới tính quota. Phân tích lại mã đã có
              trong 24h thì miễn phí.
            </p>
          </div>
          <div>
            <p className="font-medium text-navy">
              Thanh toán qua phương thức nào?
            </p>
            <p className="mt-1">
              Thanh toán qua Stripe thông qua Clerk Billing (Visa/Mastercard
              quốc tế).
            </p>
          </div>
        </div>
      </div>

      <div className="text-center">
        <Link
          to="/"
          className="text-sm font-medium text-slate-500 transition hover:text-teal"
        >
          ← Quay lại trang chủ
        </Link>
      </div>
    </div>
  );
}

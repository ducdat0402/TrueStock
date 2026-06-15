import { Link } from "react-router-dom";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: "quota" | "feature";
  quotaInfo?: {
    used: number;
    limit: number;
  };
}

export function UpgradeModal({
  isOpen,
  onClose,
  reason = "feature",
  quotaInfo,
}: UpgradeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-navy/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Content */}
        <div className="text-center">
          {/* Icon */}
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-orange-100 text-2xl">
            {reason === "quota" ? "⚡" : "✨"}
          </div>

          {/* Title */}
          <h2 className="mt-4 text-xl font-bold text-navy">
            {reason === "quota"
              ? "Nâng cấp để tiếp tục phân tích"
              : "Tính năng Premium"}
          </h2>

          {/* Description */}
          <p className="mt-2 text-sm text-slate-600">
            {reason === "quota" && quotaInfo
              ? `Bạn đã dùng hết ${quotaInfo.limit} lượt phân tích miễn phí hôm nay.`
              : "Tính năng này chỉ dành cho thành viên Premium."}
          </p>

          {/* Benefits */}
          <div className="mt-4 rounded-xl bg-gradient-to-b from-teal/10 to-white p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-teal">
              Premium bao gồm
            </p>
            <ul className="space-y-1.5 text-left text-sm text-slate-700">
              <li className="flex items-center gap-2">
                <span className="text-teal">✓</span>
                Phân tích không giới hạn
              </li>
              <li className="flex items-center gap-2">
                <span className="text-teal">✓</span>
                So sánh tối đa 5 mã cổ phiếu
              </li>
              <li className="flex items-center gap-2">
                <span className="text-teal">✓</span>
                Cảnh báo biến động real-time
              </li>
              <li className="flex items-center gap-2">
                <span className="text-teal">✓</span>
                Theo dõi danh mục đầu tư
              </li>
            </ul>
          </div>

          {/* Price */}
          <div className="mt-4 flex items-baseline justify-center gap-1">
            <span className="text-2xl font-bold text-navy">129.000đ</span>
            <span className="text-slate-500">/tháng</span>
          </div>

          {/* CTA */}
          <div className="mt-6 space-y-3">
            <Link
              to="/pricing"
              className="block w-full rounded-xl bg-gradient-to-r from-teal to-teal-dark px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:shadow-lg"
              onClick={onClose}
            >
              Xem chi tiết gói Premium
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="block w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Để sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

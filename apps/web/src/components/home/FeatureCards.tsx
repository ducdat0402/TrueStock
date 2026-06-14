const FEATURES = [
  {
    title: "Dễ hiểu",
    description:
      "Giải thích bằng tiếng Việt thường ngày, không thuật ngữ tài chính khó hiểu.",
    icon: "💬",
    accent: "from-teal/10 to-teal/5",
  },
  {
    title: "Khách quan",
    description:
      "Phân tích dựa trên số liệu thực, không thiên vị môi giới hay quảng cáo.",
    icon: "⚖️",
    accent: "from-navy/10 to-navy/5",
  },
  {
    title: "Nhanh chóng",
    description:
      "Nhập mã cổ phiếu, nhận kết quả phân tích AI trong vài chục giây.",
    icon: "⚡",
    accent: "from-amber-500/10 to-amber-500/5",
  },
] as const;

export function FeatureCards() {
  return (
    <section>
      <h2 className="mb-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-400 sm:mb-4 sm:text-sm">
        Tại sao chọn TrueStock?
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3">
        {FEATURES.map((feature, i) => (
          <div
            key={feature.title}
            className={`card card-hover bg-gradient-to-br p-4 sm:p-6 ${feature.accent} ${
              i === 2 ? "sm:col-span-2 md:col-span-1" : ""
            }`}
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-lg shadow-sm sm:h-11 sm:w-11 sm:text-xl">
              {feature.icon}
            </span>
            <h3 className="mt-3 font-semibold text-navy sm:mt-4">{feature.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600 sm:mt-2">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

interface HeroSectionProps {
  children?: React.ReactNode;
}

export function HeroSection({ children }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-navy via-navy to-navy-light px-4 py-10 shadow-xl ring-1 ring-white/10 sm:rounded-3xl sm:px-6 sm:py-12 md:px-12 md:py-16">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-teal/25 blur-3xl sm:h-64 sm:w-64" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-teal/15 blur-2xl sm:h-48 sm:w-48" />

      <div className="relative mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-teal/30 bg-teal/15 px-3 py-1 text-xs font-medium text-teal-light sm:px-4 sm:text-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-teal-light animate-pulse" />
          Dành cho nhà đầu tư F0
        </span>
        <h1 className="mt-4 text-2xl font-extrabold leading-tight tracking-tight sm:mt-5 sm:text-3xl md:text-5xl">
          Hiểu cổ phiếu bằng ngôn ngữ của bạn
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-white/70 sm:mt-4 sm:text-base md:text-lg">
          Nhập mã cổ phiếu để nhận phân tích tài chính dễ hiểu — không thuật ngữ,
          không thiên vị môi giới.
        </p>

        {children && <div className="mt-6 sm:mt-8">{children}</div>}
      </div>
    </section>
  );
}

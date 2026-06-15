import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@clerk/react";
import { AuthButtons } from "../auth/AuthButtons";
import { useAlerts } from "../../hooks/useAlerts";

function NavLink({ to, label }: { to: string; label: string }) {
  const location = useLocation();
  const active =
    to === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(to);

  return (
    <Link
      to={to}
      className={`relative shrink-0 rounded-lg px-2.5 py-1.5 text-sm font-medium transition sm:px-3 sm:py-1.5 ${
        active
          ? "bg-white/15 text-white"
          : "text-white/75 hover:bg-white/10 hover:text-white"
      }`}
    >
      {label}
    </Link>
  );
}

function NotificationBadge() {
  const { isSignedIn } = useAuth();
  const { unreadCount } = useAlerts();

  if (!isSignedIn || unreadCount === 0) return null;

  return (
    <Link
      to="/dashboard"
      className="relative flex h-8 w-8 items-center justify-center rounded-lg text-white/75 transition hover:bg-white/10 hover:text-white"
      title={`${unreadCount} thông báo chưa đọc`}
    >
      <span className="text-lg">🔔</span>
      <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
        {unreadCount > 9 ? "9+" : unreadCount}
      </span>
    </Link>
  );
}

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-navy/95 shadow-lg backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4 md:py-4">
          <Link
            to="/"
            className="flex shrink-0 items-center gap-2 text-base font-bold tracking-tight text-white transition hover:opacity-90 sm:gap-2.5 sm:text-lg"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-teal to-teal-dark text-xs font-black shadow-md sm:h-9 sm:w-9 sm:text-sm">
              TS
            </span>
            <span>
              True<span className="text-teal-light">Stock</span>
            </span>
          </Link>

          <nav className="flex w-full items-center justify-between gap-1 overflow-x-auto pb-0.5 sm:w-auto sm:justify-end sm:gap-2 sm:overflow-visible sm:pb-0">
            <div className="flex items-center gap-1 sm:gap-2">
              <NavLink to="/" label="Trang chủ" />
              <NavLink to="/pricing" label="Bảng giá" />
              <NavLink to="/dashboard" label="Dashboard" />
            </div>
            <div className="flex shrink-0 items-center gap-2 border-l border-white/15 pl-2 sm:gap-3 sm:pl-3">
              <NotificationBadge />
              <AuthButtons />
            </div>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-3 py-6 sm:px-4 sm:py-8 md:py-10">
        <div className="page-enter">
          <Outlet />
        </div>
      </main>

      <footer className="mt-auto border-t border-slate-200/80 bg-white/80 px-4 py-6 text-center backdrop-blur-sm sm:py-8">
        <p className="text-sm font-medium text-navy">TrueStock</p>
        <p className="mt-1 text-sm text-slate-500">
          Phân tích cổ phiếu cho nhà đầu tư F0
        </p>
        <p className="mt-3 text-xs text-slate-400">
          Thông tin tham khảo, không phải tư vấn đầu tư
        </p>
      </footer>
    </div>
  );
}

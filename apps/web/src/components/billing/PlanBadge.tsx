import { Link } from "react-router-dom";
import { useAuth } from "@clerk/react";
import { useMe } from "../../hooks/useMe";

export function PlanBadge() {
  const { isSignedIn, isLoaded } = useAuth();
  const { data, loading } = useMe();

  if (!isLoaded || !isSignedIn || loading || !data) {
    return null;
  }

  const isPremium = data.plan === "premium" || data.plan === "b2b";

  if (isPremium) {
    return (
      <span className="hidden rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white shadow-sm sm:inline-block">
        Premium
      </span>
    );
  }

  return (
    <Link
      to="/pricing"
      className="hidden rounded-full border border-white/25 bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold text-white/90 transition hover:bg-white/20 sm:inline-block"
      title="Nâng cấp Premium"
    >
      Free · Nâng cấp
    </Link>
  );
}

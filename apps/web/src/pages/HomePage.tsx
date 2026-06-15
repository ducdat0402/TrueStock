import { useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { SignInButton } from "@clerk/react";
import { QuotaBanner } from "../components/billing/QuotaBanner";
import { FeatureCards } from "../components/home/FeatureCards";
import { HeroSection } from "../components/home/HeroSection";
import { PopularTickers } from "../components/home/PopularTickers";
import { RecentSearches } from "../components/home/RecentSearches";
import { SearchBox } from "../components/home/SearchBox";

export function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const showSignIn = searchParams.get("sign-in") === "true";

  useEffect(() => {
    if (showSignIn) {
      setSearchParams({}, { replace: true });
    }
  }, [showSignIn, setSearchParams]);

  return (
    <div className="space-y-8 sm:space-y-10">
      <QuotaBanner />

      <HeroSection>
        <SearchBox variant="hero" />
        <div className="mt-5 sm:mt-6">
          <PopularTickers variant="hero" />
        </div>
        <div className="mt-4 text-center">
          <Link
            to="/compare"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-teal"
          >
            <span>⚖️</span>
            <span>So sánh nhiều mã cổ phiếu</span>
            <span>→</span>
          </Link>
        </div>
      </HeroSection>

      {showSignIn && (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-teal/30 bg-gradient-to-r from-teal/10 to-teal/5 px-4 py-3 text-center text-sm text-navy sm:flex-row">
          <span>Vui lòng đăng nhập để xem Dashboard.</span>
          <SignInButton mode="modal">
            <button
              type="button"
              className="font-semibold text-teal underline-offset-2 hover:underline"
            >
              Đăng nhập ngay
            </button>
          </SignInButton>
        </div>
      )}

      <RecentSearches />

      <FeatureCards />
    </div>
  );
}

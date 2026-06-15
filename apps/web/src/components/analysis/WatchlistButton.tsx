import { useState } from "react";
import { useAuth } from "@clerk/react";
import { SignInButton } from "@clerk/react";
import { useWatchlist } from "../../hooks/useWatchlist";

interface WatchlistButtonProps {
  ticker: string;
  score?: number;
}

export function WatchlistButton({ ticker, score }: WatchlistButtonProps) {
  const { isSignedIn } = useAuth();
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const [loading, setLoading] = useState(false);

  const inWatchlist = isInWatchlist(ticker);

  const handleClick = async () => {
    setLoading(true);
    try {
      if (inWatchlist) {
        await removeFromWatchlist(ticker);
      } else {
        await addToWatchlist(ticker, score);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isSignedIn) {
    return (
      <SignInButton mode="modal">
        <button
          type="button"
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700"
        >
          <span>☆</span>
          <span>Theo dõi</span>
        </button>
      </SignInButton>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition disabled:opacity-50 ${
        inWatchlist
          ? "border-amber-300 bg-amber-50 text-amber-700 hover:border-amber-400 hover:bg-amber-100"
          : "border-slate-200 bg-white text-slate-600 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700"
      }`}
    >
      <span>{inWatchlist ? "★" : "☆"}</span>
      <span>{loading ? "..." : inWatchlist ? "Đang theo dõi" : "Theo dõi"}</span>
    </button>
  );
}

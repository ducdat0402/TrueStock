import { useAuth, SignInButton, SignUpButton, UserButton } from "@clerk/react";

export function AuthButtons() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return <div className="h-8 w-20 animate-pulse rounded-lg bg-white/10" />;
  }

  if (isSignedIn) {
    return (
      <UserButton
        appearance={{
          elements: {
            avatarBox: "h-8 w-8 ring-2 ring-white/20",
          },
        }}
      />
    );
  }

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <SignInButton mode="modal">
        <button
          type="button"
          className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-white/90 transition hover:bg-white/10 sm:px-3"
        >
          Đăng nhập
        </button>
      </SignInButton>
      <SignUpButton mode="modal">
        <button
          type="button"
          className="rounded-lg bg-teal px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-light sm:px-3"
        >
          Đăng ký
        </button>
      </SignUpButton>
    </div>
  );
}

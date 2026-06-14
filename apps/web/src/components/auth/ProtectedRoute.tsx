import { useAuth } from "@clerk/react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <div className="py-12 text-center text-slate-500">Đang tải...</div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/?sign-in=true" replace />;
  }

  return <>{children}</>;
}

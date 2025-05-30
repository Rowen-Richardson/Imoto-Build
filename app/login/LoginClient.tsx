"use client";

import LoginPage from "@/components/login-page";
import { useRouter, useSearchParams } from "next/navigation";
import type { UserProfile } from "@/types/user";
import { useUser } from "@/components/UserContext";

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  // Header navigation handlers for all main routes
  const handleLogin = () => router.push("/login");
  const handleDashboard = () => router.push("/dashboard");
  const handleGoHome = () => router.push("/");
  const handleShowAllCars = () => router.push("/car-marketplace");
  const handleGoToSell = () => router.push("/upload-vehicle");
  const handleSignOut = () => router.push("/login");

  const { setUser } = useUser();

  return (
    <LoginPage
      next={next}
      onLoginSuccess={(userData) => {
        setUser(userData);
        if (next) {
          router.push(next);
        } else {
          router.push("/dashboard");
        }
      }}
      onCancel={() => router.push("/")}
      loginContext={"default"}
      onDashboardClick={handleDashboard}
      onGoHome={handleGoHome}
      onShowAllCars={handleShowAllCars}
      onGoToSellPage={handleGoToSell}
      onSignOut={handleSignOut}
      HeaderPropsOverride={{
        onLoginClick: handleLogin,
        onDashboardClick: handleDashboard,
        onGoHome: handleGoHome,
        onShowAllCars: handleShowAllCars,
        onGoToSellPage: handleGoToSell,
        onSignOut: handleSignOut,
      }}
    />
  );
}

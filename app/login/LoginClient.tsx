"use client";

import LoginPage from "@/components/login-page";
import { useRouter } from "next/navigation";
import type { UserProfile } from "@/types/user";

export default function LoginClient() {
  const router = useRouter();
  // Header navigation handlers for all main routes
  const handleLogin = () => router.push("/login");
  const handleDashboard = () => router.push("/dashboard");
  const handleGoHome = () => router.push("/");
  const handleShowAllCars = () => router.push("/car-marketplace");
  const handleGoToSell = () => router.push("/upload-vehicle");
  const handleSignOut = () => router.push("/login");

  // Placeholder user for login success
  const user: UserProfile = {
    id: "1",
    email: "user@example.com",
    firstName: "John",
    lastName: "Doe",
    profilePic: undefined,
    loginMethod: "email",
    phone: "",
    suburb: "",
    city: "",
    province: "",
  };

  return (
    <LoginPage
      onLoginSuccess={() => router.push("/dashboard")}
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

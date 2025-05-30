"use client";

import CarMarketplace from "@/components/car-marketplace";
import { useRouter } from "next/navigation";

export default function CarMarketplaceClient() {
  const router = useRouter();
  // Header navigation handlers for all main routes
  const handleLogin = () => router.push("/login");
  const handleDashboard = () => router.push("/dashboard");
  const handleGoHome = () => router.push("/");
  const handleShowAllCars = () => router.push("/car-marketplace");
  const handleGoToSell = () => router.push("/upload-vehicle");
  const handleSignOut = () => router.push("/login");

  return (
    <CarMarketplace
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

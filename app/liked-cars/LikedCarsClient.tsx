"use client";

import LikedCars from "@/components/liked-cars";
import { useRouter } from "next/navigation";
import type { Vehicle } from "@/lib/data";

export default function LikedCarsClient() {
  const router = useRouter();
  // Header navigation handlers for all main routes
  const handleLogin = () => router.push("/login");
  const handleDashboard = () => router.push("/dashboard");
  const handleGoHome = () => router.push("/");
  const handleShowAllCars = () => router.push("/car-marketplace");
  const handleGoToSell = () => router.push("/upload-vehicle");
  const handleSignOut = () => router.push("/login");

  // Placeholder liked vehicles and handlers
  const likedVehicles: Vehicle[] = [];
  const handleViewAll = () => router.push("/liked-cars-page");
  const handleViewDetails = (vehicle: Vehicle) => router.push("/car-marketplace");

  return (
    <LikedCars
      likedVehicles={likedVehicles}
      onViewAll={handleViewAll}
      onViewDetails={handleViewDetails}
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

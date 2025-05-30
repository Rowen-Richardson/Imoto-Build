"use client";

import LikedCarsPage from "@/components/liked-cars-page";
import { useRouter } from "next/navigation";
import type { Vehicle } from "@/lib/data";
import type { UserProfile } from "@/types/user";

export default function LikedCarsPageClient() {
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
  const user: UserProfile | null = {
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
  const handleBack = () => router.push("/dashboard");
  const handleViewDetails = (vehicle: Vehicle) => router.push("/car-marketplace");
  const handleNavigateToUpload = () => router.push("/upload-vehicle");

  return (
    <LikedCarsPage
      likedVehicles={likedVehicles}
      onBack={handleBack}
      onViewDetails={handleViewDetails}
      user={user}
      onSignOut={handleSignOut}
      onGoHome={handleGoHome}
      onShowAllCars={handleShowAllCars}
      onNavigateToUpload={handleNavigateToUpload}
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

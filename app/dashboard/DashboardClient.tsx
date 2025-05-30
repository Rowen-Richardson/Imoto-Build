"use client";

import Dashboard from "@/components/dashboard";
import type { UserProfile } from "@/types/user";
import { useUser } from "@/components/UserContext";
import { useRouter } from "next/navigation";

export default function DashboardClient() {
  const router = useRouter();
  const { user } = useUser();

  // Header navigation handlers for all main routes
  // Make login button act as a back button to car-marketplace
  const handleLogin = () => router.push("/car-marketplace");
  const handleDashboard = () => router.push("/dashboard");
  const handleGoHome = () => router.push("/");
  const handleShowAllCars = () => router.push("/car-marketplace");
  const handleGoToSell = () => router.push("/upload-vehicle");
  // Do not clear user state here; only in profile-settings
  const handleSignOut = () => router.push("/login");

  return (
    <Dashboard
      user={user}
      onSignOut={handleSignOut}
      onBack={handleGoHome}
      onViewProfileSettings={() => router.push("/profile-settings")}
      onViewUploadVehicle={handleGoToSell}
      onUserUpdate={() => {}}
      onLoginClick={handleLogin} // Now acts as back to car-marketplace
      onGoHome={handleGoHome}
      onShowAllCars={handleShowAllCars}
      onGoToSellPage={handleGoToSell}
      onNavigateToUpload={handleGoToSell}
    />
  );
}

"use client";

import Dashboard from "@/components/dashboard";
import type { UserProfile } from "@/types/user";
import { useRouter } from "next/navigation";

export default function DashboardClient() {
  const router = useRouter();
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

  // Header navigation handlers for all main routes
  const handleLogin = () => router.push("/login");
  const handleDashboard = () => router.push("/dashboard");
  const handleGoHome = () => router.push("/");
  const handleShowAllCars = () => router.push("/car-marketplace");
  const handleGoToSell = () => router.push("/upload-vehicle");
  const handleSignOut = () => router.push("/login");

  return (
    <Dashboard
      user={user}
      onSignOut={handleSignOut}
      onBack={handleGoHome}
      onViewProfileSettings={() => router.push("/profile-settings")}
      onViewUploadVehicle={handleGoToSell}
      onUserUpdate={() => {}}
      onLoginClick={handleLogin}
      onGoHome={handleGoHome}
      onShowAllCars={handleShowAllCars}
      onGoToSellPage={handleGoToSell}
      onNavigateToUpload={handleGoToSell}
    />
  );
}

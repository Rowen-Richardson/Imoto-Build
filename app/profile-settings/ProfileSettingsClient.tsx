"use client";

import ProfileSettings from "@/components/profile-settings";
import { useRouter } from "next/navigation";
import type { UserProfile } from "@/types/user";

export default function ProfileSettingsClient() {
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
    <ProfileSettings
      user={user}
      onBack={handleDashboard}
      onSave={async () => {}}
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

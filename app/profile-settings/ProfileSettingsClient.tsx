"use client";

import ProfileSettings from "@/components/profile-settings";
import { useRouter } from "next/navigation";
import type { UserProfile } from "@/types/user";
import { useUser } from "@/components/UserContext";

export default function ProfileSettingsClient() {
  const router = useRouter();
  const { user, setUser } = useUser();

  // Header navigation handlers for all main routes
  const handleLogin = () => router.push("/login");
  const handleDashboard = () => router.push("/dashboard");
  const handleGoHome = () => router.push("/");
  const handleShowAllCars = () => router.push("/car-marketplace");
  const handleGoToSell = () => router.push("/upload-vehicle");
  // This is the ONLY place we clear user state
  const handleSignOut = () => {
    setUser(null);
    router.push("/car-marketplace");
  };

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

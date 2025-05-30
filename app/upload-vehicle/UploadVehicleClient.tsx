"use client";


import UploadVehicle from "@/components/upload-vehicle";
import { useRouter } from "next/navigation";
import type { UserProfile } from "@/types/user";

export default function UploadVehicleClient() {
  const router = useRouter();

  // You should fetch or get the real user from context, session, or props
  // For now, throw if not provided, or use a placeholder
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
  const handleBack = () => router.push("/dashboard");
  const handleVehicleSubmit = async (vehicleData: any) => {
    console.log("Vehicle submitted:", vehicleData);
  };
  const handleLogin = () => router.push("/login");
  const handleDashboard = () => router.push("/dashboard");
  const handleGoHome = () => router.push("/");
  const handleShowAllCars = () => router.push("/car-marketplace");
  const handleGoToSell = () => router.push("/upload-vehicle");
  const handleSignOut = () => router.push("/login");

  return (
    <UploadVehicle
      user={user}
      onBack={handleBack}
      onVehicleSubmit={handleVehicleSubmit}
      onSignOut={handleSignOut}
      onSaveProfile={async () => {}}
      // Pass header navigation handlers
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

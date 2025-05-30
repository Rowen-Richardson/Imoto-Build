"use client";

import UploadVehicle from "@/components/upload-vehicle";
import { useRouter } from "next/navigation";

// Dummy user for demonstration; replace with real user/session logic
const dummyUser = {
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

export default function UploadVehicleClient() {
  const router = useRouter();

  return (
    <UploadVehicle
      user={dummyUser}
      onBack={() => router.push("/dashboard")}
      onVehicleSubmit={async () => {}}
    />
  );
}

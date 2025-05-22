"use client"


import { useState } from "react"
import { useRouter } from 'next/router';
import { Heart, Search, ArrowLeft } from "lucide-react"
import type { Vehicle } from "@/lib/data"
import { Header } from "./ui/header"


export default function LikedCarsPage({ likedVehicles, onBack, onViewDetails, user }: LikedCarsPageProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const filteredVehicles = likedVehicles.filter((vehicle) =>
    `${vehicle.make} ${vehicle.model} ${vehicle.variant}`.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Navigation handlers
  const handleLogin = () => { router.push('/login'); };
  const handleDashboard = () => {
    if (user) router.push('/dashboard');
    else router.push('/login');
  };
  const handleGoHome = () => { router.push('/'); };
  const handleShowAllCars = () => { router.push('/'); };
  const handleGoToSell = () => {
    if (!user) {
      router.push({ pathname: '/login', query: { next: '/upload-vehicle' } });
    } else {
      router.push('/upload-vehicle');
    }
  };
  const handleSignOut = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen">
      <Header
        user={user}
        onLoginClick={handleLogin}
        onDashboardClick={handleDashboard}
        onGoHome={handleGoHome}
        onShowAllCars={handleShowAllCars}
        onGoToSellPage={handleGoToSell}
        onSignOut={handleSignOut}
        transparent={false}
      />

      <div className="pt-20 pb-10">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={onBack}
            className="mb-6 inline-flex items-center text-[#FF6700] dark:text-[#FF7D33] hover:underline"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </button>

          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Your Liked Cars</h1>
            <div className="relative">
              <input
                type="text"
                placeholder="Search your liked cars..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 pr-10 rounded-lg border border-[#9FA791] dark:border-[#4A4D45] focus:outline-none focus:border-[#FF6700] dark:focus:border-[#FF7D33] dark:bg-[#2A352A] w-64"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
          </div>

          {filteredVehicles.length === 0 ? (
            <div className="text-center py-16">
              <Heart className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <h2 className="text-xl font-semibold mb-2">No liked cars found</h2>
              <p className="opacity-70 mb-6">
                {searchTerm ? "No cars match your search criteria" : "You haven't liked any cars yet"}
              </p>
              <button
                onClick={() => (window.location.href = "/")}
                className="bg-[#FF6700] dark:bg-[#FF7D33] text-white px-6 py-3 rounded-lg hover:bg-[#FF6700]/90 dark:hover:bg-[#FF7D33]/90 transition-colors"
              >
                Browse Vehicles
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center mb-4">
                <p className="text-sm opacity-70">
                  Showing {filteredVehicles.length} of {likedVehicles.length} liked vehicles
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVehicles.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className="bg-white dark:bg-[#1F2B20] border border-[#9FA791]/20 dark:border-[#4A4D45]/20 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer relative"
                    onClick={() => onViewDetails(vehicle)}
                  >
                    <div className="absolute top-3 right-3 z-10">
                      <Heart className="w-6 h-6 text-[#FF6700] dark:text-[#FF7D33]" fill="currentColor" />
                    </div>
                    <img
                      src={vehicle.image || "/placeholder.svg"}
                      alt={`${vehicle.make} ${vehicle.model} ${vehicle.variant}`}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-2">
                        {vehicle.make} {vehicle.model} {vehicle.variant}
                      </h3>
                      <p className="opacity-80">{vehicle.price}</p>
                      <div className="flex justify-between items-center mt-4">
                        <span className="text-sm opacity-70">
                          {vehicle.city}, {vehicle.province}
                        </span>
                        <span className="text-sm opacity-70">
                          {vehicle.year} • {vehicle.mileage} km
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

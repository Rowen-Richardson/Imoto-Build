"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus, Edit, Eye, Heart, MessageSquare, Car, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Header } from "./ui/header"
import LikedCarsPage from "./liked-cars-page"
import VehicleDetails from "./vehicle-details"
import { vehicles } from "@/lib/data"
import type { Vehicle } from "@/lib/data"

interface DashboardProps {
  user: {
    email: string
    profilePic?: string
  }
  onSignOut: () => void
  onBack: () => void
  savedCars?: Vehicle[] // Add saved cars prop
  onViewDetails?: (vehicle: Vehicle) => void // Add callback for viewing details
}

export default function Dashboard({ user, onSignOut, onBack, savedCars = [], onViewDetails }: DashboardProps) {
  const [showLikedCarsPage, setShowLikedCarsPage] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [currentCarIndex, setCurrentCarIndex] = useState(0)

  // Auto-rotate carousel
  useEffect(() => {
    if (savedCars.length <= 1) return

    const interval = setInterval(() => {
      setCurrentCarIndex((current) => (current + 1) % savedCars.length)
    }, 5000) // Change slide every 5 seconds

    return () => clearInterval(interval)
  }, [savedCars.length])

  // Mock data for user metrics
  const userMetrics = {
    listingViews: 243,
    saves: 18,
    contacts: 7,
    totalListings: 3,
    freeListingsRemaining: 2,
  }

  // Handle viewing vehicle details
  const handleViewDetails = (vehicle: Vehicle) => {
    if (onViewDetails) {
      onViewDetails(vehicle)
    } else {
      setSelectedVehicle(vehicle)
    }
  }

  if (selectedVehicle) {
    return <VehicleDetails vehicle={selectedVehicle} onBack={() => setSelectedVehicle(null)} user={user} />
  }

  if (showLikedCarsPage) {
    return (
      <LikedCarsPage
        likedVehicles={savedCars}
        onBack={() => setShowLikedCarsPage(false)}
        onViewDetails={handleViewDetails}
        user={user}
      />
    )
  }

  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Top Header Section */}
      <Header user={user} onDashboardClick={onBack} transparent={false} />

      {/* Main Content Area: Fills remaining space */}
      <main className="flex-1 px-6 pb-6 overflow-auto pt-20">
        <h1 className="text-4xl font-bold mb-6">Welcome, {user.email.split("@")[0]}</h1>

        {/* Center container for the entire grid */}
        <div className="w-full mx-auto h-full">
          {/* Outer grid: 12 columns, spans full height */}
          <div className="grid grid-cols-12 gap-4 h-full">
            {/* LEFT COLUMN (9 of 12): uses 2-row structure */}
            <div className="col-span-9 grid grid-rows-[1fr_1fr] gap-4 h-full">
              {/* ROW 1: Profile, Progress, Vehicle Uploads */}
              <div className="grid grid-cols-3 gap-4">
                {/* Profile Card */}
                <Link href="/profile-settings" className="block min-w-0">
                  <Card className="rounded-3xl overflow-hidden w-full h-full transition-transform hover:scale-105 cursor-pointer">
                    <div className="relative w-full h-full">
                      {/* Using a div with initials instead of an image */}
                      <div className="w-full h-full bg-[#2E933C] flex items-center justify-center text-white">
                        <div className="text-center">
                          <div className="text-5xl font-bold mb-2">LP</div>
                          <div className="text-sm">Lora Piterson</div>
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent text-white">
                        <h3 className="text-2xl font-bold">Lora Piterson</h3>
                        <div className="mt-2">
                          <span className="inline-block border border-white/50 rounded-full px-4 py-1 text-sm">
                            UPDATE PROFILE
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>

                {/* Progress Card - Enhanced metrics display */}
                <Card className="rounded-3xl p-5 w-full h-full flex flex-col justify-between bg-gradient-to-br from-white to-gray-50">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-semibold text-[#3E5641]">Listing Metrics</h3>
                      <div className="bg-[#FF6700]/10 p-1.5 rounded-full">
                        <Eye className="w-5 h-5 text-[#FF6700]" />
                      </div>
                    </div>
                    <div className="mb-4 flex items-end gap-2">
                      <div className="text-3xl font-bold text-[#3E5641]">{userMetrics.totalListings}</div>
                      <div className="text-lg font-medium text-[#6F7F69] pb-0.5">Active Listings</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-[#FF6700]" />
                          <span className="font-medium text-[#3E5641]">Total Views</span>
                        </div>
                        <span className="text-lg font-bold text-[#3E5641]">{userMetrics.listingViews}</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#FF6700] rounded-full" style={{ width: "70%" }}></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex flex-col">
                        <div className="flex items-center justify-between mb-1">
                          <Heart className="w-4 h-4 text-pink-500" />
                          <span className="text-xs text-gray-500">Last 30 days</span>
                        </div>
                        <div className="mt-auto">
                          <div className="text-xl font-bold text-[#3E5641]">{userMetrics.saves}</div>
                          <div className="text-xs text-[#6F7F69]">Saved by users</div>
                        </div>
                      </div>

                      <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex flex-col">
                        <div className="flex items-center justify-between mb-1">
                          <MessageSquare className="w-4 h-4 text-blue-500" />
                          <span className="text-xs text-gray-500">Last 30 days</span>
                        </div>
                        <div className="mt-auto">
                          <div className="text-xl font-bold text-[#3E5641]">{userMetrics.contacts}</div>
                          <div className="text-xs text-[#6F7F69]">Buyer inquiries</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Vehicle Uploads Card - Transformed from Time Tracker */}
                <Card className="rounded-3xl p-5 w-full h-full flex flex-col justify-between bg-gradient-to-br from-[#FF6700] to-[#FF9248] text-white cursor-pointer hover:shadow-lg transition-all">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold">Vehicle Uploads</h3>
                    <Car className="w-6 h-6" />
                  </div>
                  <div className="flex-grow flex flex-col justify-center items-center my-4">
                    <div className="bg-white/20 rounded-full p-4 mb-3">
                      <Plus className="w-8 h-8" />
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold">List a New Vehicle</p>
                      <p className="text-sm opacity-80">Quick and easy process</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* ROW 2: Subscription (3 columns) and Featured Car (6 columns) */}
              <div className="grid grid-cols-9 gap-4">
                {/* Subscription Card - Repurposed from Pension */}
                <Card className="col-span-3 rounded-3xl w-full h-full flex flex-col">
                  <div className="p-5 border-b">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-semibold">Subscription</h3>
                      <Package className="h-5 w-5 text-[#FF6700]" />
                    </div>
                  </div>
                  <div className="p-5 flex-grow">
                    <div className="bg-gray-50 rounded-xl p-4 mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">Free Plan</h4>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Active</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Vehicle Listings</span>
                        <span className="font-medium">{userMetrics.totalListings}/5 Used</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                          className="bg-[#FF6700] h-2 rounded-full"
                          style={{ width: `${(userMetrics.totalListings / 5) * 100}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {userMetrics.freeListingsRemaining} free listings remaining
                      </p>
                    </div>

                    <div className="border border-dashed border-gray-300 rounded-xl p-4">
                      <h4 className="font-medium mb-2">Premium Plans</h4>
                      <p className="text-sm text-gray-500 mb-3">Unlock unlimited listings and premium features</p>
                      <Button variant="outline" className="w-full text-[#FF6700] border-[#FF6700] hover:bg-[#FFF8E0]">
                        Coming Soon
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* Featured Car Card - Replaces Calendar */}
                <Card className="col-span-6 rounded-3xl overflow-hidden w-full h-full relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent z-10"></div>
                  <img
                    src={
                      savedCars.length > 0
                        ? savedCars[currentCarIndex]?.image || "/placeholder.svg?height=400&width=600"
                        : "/placeholder.svg?height=400&width=600&text=No+Saved+Cars"
                    }
                    alt={
                      savedCars.length > 0
                        ? `${savedCars[currentCarIndex]?.make} ${savedCars[currentCarIndex]?.model}`
                        : "No saved cars"
                    }
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="relative z-20 h-full flex flex-col justify-between p-6">
                    <div className="flex justify-between">
                      <span
                        onClick={() => setShowLikedCarsPage(true)}
                        className="bg-[#FF6700] text-white px-3 py-1 rounded-full text-sm cursor-pointer hover:bg-[#FF7D33] transition-colors"
                      >
                        View Saved Cars
                      </span>
                      {savedCars.length > 0 && (
                        <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                          {savedCars.length} saved cars
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between items-end">
                      {savedCars.length > 0 ? (
                        <>
                          <div
                            className="text-white cursor-pointer"
                            onClick={() => handleViewDetails(savedCars[currentCarIndex])}
                          >
                            <h3 className="text-2xl font-bold mb-1">
                              {savedCars[currentCarIndex]?.year} {savedCars[currentCarIndex]?.make}{" "}
                              {savedCars[currentCarIndex]?.model}
                            </h3>
                            <p className="text-white/80 mb-2">
                              {savedCars[currentCarIndex]?.variant} • {savedCars[currentCarIndex]?.mileage} km
                            </p>
                            <p className="text-xl font-bold text-[#FF6700]">{savedCars[currentCarIndex]?.price}</p>
                          </div>
                          <Button
                            className="bg-white text-[#3E5641] hover:bg-white/90"
                            onClick={() => {
                              // Open contact form or modal
                              if (savedCars[currentCarIndex]) {
                                window.open(
                                  `mailto:${savedCars[currentCarIndex].sellerEmail}?subject=Inquiry about your ${savedCars[currentCarIndex].year} ${savedCars[currentCarIndex].make} ${savedCars[currentCarIndex].model}&body=Hello ${savedCars[currentCarIndex].sellerName},%0D%0A%0D%0AI am interested in your ${savedCars[currentCarIndex].year} ${savedCars[currentCarIndex].make} ${savedCars[currentCarIndex].model} listed for ${savedCars[currentCarIndex].price}.%0D%0A%0D%0APlease contact me with more information.%0D%0A%0D%0AThank you.`,
                                )
                              }
                            }}
                          >
                            Contact Seller
                          </Button>
                        </>
                      ) : (
                        <div className="text-white text-center w-full">
                          <Car className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <h3 className="text-xl font-bold mb-1">No Saved Cars</h3>
                          <p className="text-white/80 mb-4">Save cars you're interested in to see them here</p>
                          <Button className="bg-white text-[#3E5641] hover:bg-white/90" onClick={onBack}>
                            Browse Cars
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Carousel indicators */}
                    {savedCars.length > 1 && (
                      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                        {savedCars.map((_, index) => (
                          <button
                            key={index}
                            className={`w-2 h-2 rounded-full transition-all ${
                              currentCarIndex === index ? "bg-white w-4" : "bg-white/40"
                            }`}
                            onClick={() => setCurrentCarIndex(index)}
                            aria-label={`Go to slide ${index + 1}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </div>

            {/* RIGHT COLUMN (3 of 12): Recently Listed Cars */}
            <div className="col-span-3 h-full">
              <Card className="rounded-3xl w-full h-full flex flex-col">
                <div className="p-5 border-b flex justify-between items-center">
                  <h3 className="text-xl font-semibold">Recently Listed Cars</h3>
                  <Button variant="ghost" size="sm" className="text-[#FF6700]">
                    View All
                  </Button>
                </div>

                <div className="flex-grow overflow-auto p-3">
                  {vehicles.slice(0, 5).map((vehicle) => (
                    <div
                      key={vehicle.id}
                      className="flex items-center gap-3 p-3 mb-2 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-16 h-12 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                        <img
                          src={vehicle.image || "/placeholder.svg"}
                          alt={`${vehicle.make} ${vehicle.model}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="font-medium truncate">
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </div>
                        <div className="text-sm text-gray-500">{vehicle.price}</div>
                      </div>
                      <Button variant="ghost" size="icon" className="flex-shrink-0">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="p-4 border-t">
                  <Button variant="outline" className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Listing
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

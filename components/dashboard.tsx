"use client"
import { useState, useEffect } from "react" // Added useEffect
import { ChevronDown, Play, Pause } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ThemeProvider } from "./theme-provider"
import { Header } from "./ui/header"
import LikedCars from "./liked-cars"
import LikedCarsPage from "./liked-cars-page"
import VehicleDetails from "./vehicle-details"
import ProfileSettings from "./profile-settings"
import { vehicles } from "@/lib/data"
import type { Vehicle, UserProfile } from "@/lib/data"

interface DashboardProps {
  user: {
    email: string
    profilePic?: string
    firstName?: string
    lastName?: string
    phone?: string // Added phone
    suburb?: string
    city?: string
    province?: string
    loginMethod?: 'email' | 'google' | 'facebook' | 'apple'
  }
  onSignOut: () => void
  onBack: () => void
}

export default function Dashboard({ user, onSignOut, onBack }: DashboardProps) {
  const [likedVehicles, setLikedVehicles] = useState<Vehicle[]>(vehicles.slice(0, 3))
  const [showLikedCarsPage, setShowLikedCarsPage] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [showProfileSettings, setShowProfileSettings] = useState(false)

  // --- State for User Profile Data ---
  // Initialize state with data derived from the prop
  const [userProfileData, setUserProfileData] = useState<UserProfile>(() => ({
    email: user.email,
    profilePic: user.profilePic,
    firstName: user.firstName || user.email.split("@")[0] || "User",
    lastName: user.lastName || "",
    phone: user.phone || "", // Include phone
    suburb: user.suburb || "",
    city: user.city || "",
    province: user.province || "",
    loginMethod: user.loginMethod || 'email',
  }));

  // --- Effect to update state if the user prop changes externally ---
  // (Optional but good practice if the parent component might update the user prop)
  useEffect(() => {
    setUserProfileData({
      email: user.email,
      profilePic: user.profilePic,
      firstName: user.firstName || user.email.split("@")[0] || "User",
      lastName: user.lastName || "",
      phone: user.phone || "",
      suburb: user.suburb || "",
      city: user.city || "",
      province: user.province || "",
      loginMethod: user.loginMethod || 'email',
    });
  }, [user]); // Dependency array includes the user prop

  // Function to handle saving profile changes
  const handleProfileSave = async (updatedProfile: Partial<UserProfile>) => {
    console.log("Saving profile:", updatedProfile)
    // --- TODO: Implement actual profile update logic here ---
    // Example: Call an API endpoint
    // try {
    //   const response = await api.updateUserProfile(updatedProfile);
    //   // Assuming the API returns the fully updated profile or confirms success
    //   setUserProfileData(prevData => ({ ...prevData, ...updatedProfile })); // Update state on success
    //   alert("Profile updated successfully!"); // Provide feedback
    //   setShowProfileSettings(false); // Go back to the dashboard view
    // } catch (error) {
    //   console.error("Failed to update profile:", error);
    //   alert("Failed to update profile. Please try again."); // Provide error feedback
    // }

    // --- Simulation ---
    // Simulate successful save and update the state
    setUserProfileData(prevData => ({
      ...prevData,
      ...updatedProfile // Merge the changes into the existing state
    }));
    alert("Profile changes simulated. Check console for data.") // Replace with better feedback
    setShowProfileSettings(false) // Go back to the dashboard view
    // --- End Simulation ---
  }


  // Conditional rendering based on the current view state
  if (selectedVehicle) {
    return (
      <ThemeProvider>
        {/* Pass updated userProfileData to Header if VehicleDetails uses it */}
        {/* <Header user={userProfileData} ... /> */}
        <VehicleDetails vehicle={selectedVehicle} onBack={() => setSelectedVehicle(null)} />
      </ThemeProvider>
    )
  }

  if (showLikedCarsPage) {
    return (
      <ThemeProvider>
        {/* LikedCarsPage includes its own Header, pass updated userProfileData */}
        <LikedCarsPage
          likedVehicles={likedVehicles}
          onBack={() => setShowLikedCarsPage(false)}
          onViewDetails={setSelectedVehicle}
          user={userProfileData} // Pass the state object here
        />
      </ThemeProvider>
    )
  }

  if (showProfileSettings) {
    return (
      <ThemeProvider>
         {/* Pass updated userProfileData to Header */}
         <Header user={userProfileData} onDashboardClick={() => setShowProfileSettings(false)} transparent={false} />
        <ProfileSettings
          user={userProfileData} // Pass the state object
          onBack={() => setShowProfileSettings(false)}
          onSave={handleProfileSave} // Pass the updated save handler
        />
      </ThemeProvider>
    )
  }

  // Default Dashboard View
  return (
    <ThemeProvider>
      <div className="h-screen bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] flex flex-col">
        {/* Pass updated userProfileData to Header */}
        <Header user={userProfileData} onDashboardClick={onBack} transparent={false} />

        <main className="flex-1 px-6 pb-6 overflow-auto pt-20">
          {/* Use userProfileData state for display */}
          <h1 className="text-4xl font-bold mb-6">Welcome, {userProfileData.firstName}</h1>

          <div className="w-full mx-auto h-full">
            <div className="grid grid-cols-12 gap-4 h-full">
              <div className="col-span-9 grid grid-rows-[1fr_1fr] gap-4 h-full">
                <div className="grid grid-cols-3 gap-4">

                  {/* Profile Card - Uses userProfileData state */}
                  <div
                    onClick={() => setShowProfileSettings(true)}
                    className="block min-w-0 cursor-pointer"
                  >
                    <Card className="rounded-3xl overflow-hidden w-full h-full transition-transform hover:scale-105">
                      <div className="relative w-full h-full">
                        {/* Use userProfileData state for image */}
                        {userProfileData.profilePic ? (
                           <img src={userProfileData.profilePic} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-[#2E933C] flex items-center justify-center text-white">
                            <div className="text-center">
                              {/* Use userProfileData state for initials */}
                              <div className="text-5xl font-bold mb-2">
                                {(userProfileData.firstName?.[0] || '') + (userProfileData.lastName?.[0] || '') || userProfileData.email[0].toUpperCase()}
                              </div>
                              <div className="text-sm">{userProfileData.firstName} {userProfileData.lastName}</div>
                            </div>
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent text-white">
                          {/* Use userProfileData state for name */}
                          <h3 className="text-2xl font-bold">{userProfileData.firstName} {userProfileData.lastName}</h3>
                          <div className="mt-2">
                            <span className="inline-block border border-white/50 rounded-full px-4 py-1 text-sm">
                              UPDATE PROFILE
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                  {/* End Profile Card */}

                  {/* Progress Card (Static Content) */}
                  <Card className="rounded-3xl p-5 w-full h-full flex flex-col justify-between">
                    {/* ... content ... */}
                     <div>
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-xl font-semibold">Progress</h3>
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                           <path d="M7 17L17 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                           <path d="M7 7H17V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div className="mb-2">
                        <div className="text-2xl font-bold">6.1 h</div>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="flex justify-between mt-4">
                        {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => {
                          const isHighlight = i === 4
                          const isWeekend = i === 0 || i === 6
                          const barColor = isHighlight ? "bg-[#ffcc33]" : isWeekend ? "bg-gray-200 dark:bg-gray-700" : "bg-gray-800 dark:bg-gray-500"

                          return (
                            <div key={i} className="flex flex-col items-center">
                              <div className={`w-1 h-16 mb-2 ${barColor}`}></div>
                              <div className={`w-2 h-2 rounded-full mb-2 ${barColor}`}></div>
                              <div className="text-xs">{day}</div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </Card>

                  {/* Time Tracker Card (Static Content) */}
                  <Card className="rounded-3xl p-5 w-full h-full flex flex-col justify-between">
                    {/* ... content ... */}
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-semibold">Time tracker</h3>
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                         <path d="M7 17L17 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                         <path d="M7 7H17V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="flex justify-center">
                      <div className="relative">
                        <svg className="w-32 h-32" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeOpacity="0.1" strokeWidth="6" />
                          <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="#ffcc33"
                            strokeWidth="6"
                            strokeDasharray="282.6"
                            strokeDashoffset="70"
                            transform="rotate(-90 50 50)"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <div className="text-2xl font-bold">02:35</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Work Time</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-center space-x-4">
                      <Button variant="ghost" className="rounded-full p-2">
                        <Play className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" className="rounded-full p-2">
                        <Pause className="h-5 w-5" />
                      </Button>
                      <Button variant="default" className="rounded-full p-2 ml-auto bg-gray-800 dark:bg-gray-600 text-white">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                           <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                           <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </Button>
                    </div>
                  </Card>
                </div>

                {/* ROW 2 (Static Content) */}
                <div className="grid grid-cols-9 gap-4">
                  <Card className="col-span-3 rounded-3xl w-full h-full flex flex-col">
                    {/* ... content ... */}
                     <div className="divide-y dark:divide-gray-700 flex-1">
                      <div className="p-4">
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium">Pension contributions</h3>
                          <ChevronDown className="h-5 w-5" />
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium">Devices</h3>
                          <ChevronDown className="h-5 w-5 transform rotate-180" />
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-12 h-10 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center mr-3">
                              <svg
                                className="w-8 h-8 text-gray-600 dark:text-gray-400"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                 <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
                                 <path d="M12 20V20.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                              </svg>
                            </div>
                            <div>
                              <div className="font-medium">MacBook Air</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Version M1</div>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="12" cy="12" r="1" fill="currentColor" />
                              <circle cx="12" cy="6" r="1" fill="currentColor" />
                              <circle cx="12" cy="18" r="1" fill="currentColor" />
                            </svg>
                          </Button>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium">Compensation Summary</h3>
                          <ChevronDown className="h-5 w-5" />
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium">Employee Benefits</h3>
                          <ChevronDown className="h-5 w-5" />
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="col-span-6 rounded-3xl p-5 w-full h-full flex flex-col">
                    {/* Calendar Content (Static) */}
                     <div className="flex justify-between items-center mb-2">
                      <Button variant="ghost" className="text-sm">
                        August
                      </Button>
                      <div className="text-lg font-medium">September 2024</div>
                      <Button variant="ghost" className="text-sm">
                        October
                      </Button>
                    </div>
                    <div className="grid grid-cols-7 gap-2 text-center mb-1">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                        <div key={day} className="text-xs text-gray-500 dark:text-gray-400">{day}</div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-2 text-center">
                      {[...Array(5)].map((_, i) => <div key={`empty-${i}`} className="text-xs text-gray-400 dark:text-gray-600"></div>)}
                      <div className="text-xs">1</div>
                      <div className="text-xs">2</div>
                      {[...Array(7)].map((_, i) => <div key={`day-${i+3}`} className="text-xs">{i+3}</div>)}
                      <div className="text-xs p-1 rounded-full bg-[#FF6700]/20 dark:bg-[#FF7D33]/20 text-[#FF6700] dark:text-[#FF7D33]">10</div>
                      {[...Array(20)].map((_, i) => <div key={`day-${i+11}`} className="text-xs">{i+11}</div>)}
                    </div>
                    <div className="mt-4 grid grid-cols-1 gap-2 flex-grow">
                      {['8:00 am', '9:00 am', '10:00 am', '11:00 am', '12:00 pm', '1:00 pm'].map(time => (
                        <div key={time} className="grid grid-cols-7 gap-2 items-center">
                          <div className="text-right text-xs text-gray-500 dark:text-gray-400">{time}</div>
                          <div className="col-span-6 border-b border-gray-200 dark:border-gray-700 h-px"></div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>

              {/* RIGHT COLUMN: Liked Cars */}
              <div className="col-span-3 h-full">
                <LikedCars
                  likedVehicles={likedVehicles}
                  onViewAll={() => setShowLikedCarsPage(true)}
                  onViewDetails={setSelectedVehicle}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </ThemeProvider>
  )
}

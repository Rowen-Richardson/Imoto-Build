"use client"
import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import {
  ChevronDown,
  Play,
  Pause,
  UploadCloud,
  ArrowRight,
  ArrowLeft,
  Camera,
  Save,
  AlertCircle,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Header } from "./ui/header"
import LikedCars from "./liked-cars"
import LikedCarsPage from "./liked-cars-page"
import VehicleDetails from "./vehicle-details"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import ProfileSettings from "./profile-settings"
import { vehicles } from "@/lib/data"
import type { Vehicle } from "@/lib/data"
import { ThemeProvider } from "@/components/theme-provider" // Added missing import

interface DashboardProps {
  user: {
    email: string
    profilePic?: string
    firstName?: string
    lastName?: string
    phone?: string
    suburb?: string
    city?: string
    province?: string
    loginMethod?: 'email' | 'google' | 'facebook' | 'apple'
  }
  onSignOut: () => void
  onBack: () => void
  onShowAllCars?: () => void;
}

export default function Dashboard({ user, onSignOut, onBack, onShowAllCars }: DashboardProps) {
  const [likedVehicles, setLikedVehicles] = useState<Vehicle[]>(vehicles.slice(0, 3))
  const [showLikedCarsPage, setShowLikedCarsPage] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [showProfileSettings, setShowProfileSettings] = useState(false)
  const [showVehicleUploadPage, setShowVehicleUploadPage] = useState(false)

  const [userProfileData, setUserProfileData] = useState<UserProfile>(() => ({
    email: user.email,
    profilePic: user.profilePic,
    firstName: user.firstName || user.email.split("@")[0] || "User",
    lastName: user.lastName || "",
    phone: user.phone || "",
    suburb: user.suburb || "",
    city: user.city || "",
    province: user.province || "",
    loginMethod: user.loginMethod || 'email',
  }));

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
  }, [user]);

  const handleProfileSave = async (updatedProfile: Partial<UserProfile>) => {
    setUserProfileData(prevData => ({
      ...prevData,
      ...updatedProfile
    }));
    alert("Profile changes simulated. Check console for data.")
    setShowProfileSettings(false)
  }

  const VehicleUploadPage = () => {
    const [vehicleData, setVehicleData] = useState<Partial<Vehicle>>({
      make: "", model: "", variant: "", year: new Date().getFullYear(), mileage: 0,
      transmission: "Automatic", fuel: "Petrol", engineCapacity: "", bodyType: "Sedan",
      price: "", description: "",
      sellerName: `${userProfileData.firstName || ""} ${userProfileData.lastName || ""}`.trim(),
      sellerEmail: userProfileData.email,
      sellerPhone: userProfileData.phone || "",
      city: userProfileData.city || "",
      province: userProfileData.province || "",
    });
    const [images, setImages] = useState<string[]>([])
    const [imageFiles, setImageFiles] = useState<File[]>([])
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target
      setVehicleData(prev => ({ ...prev, [name]: value }))
      setError(null)
      setSuccess(null)
    }

    const handleSelectChange = (name: keyof Vehicle) => (value: string) => {
      setVehicleData(prev => ({ ...prev, [name]: value }))
      setError(null)
      setSuccess(null)
    }

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files
      if (files) {
        const newImages: string[] = []
        const newImageFiles: File[] = []
        Array.from(files).forEach(file => {
          if (file.type.startsWith("image/")) {
            const reader = new FileReader()
            reader.onload = () => {
              if (reader.result) {
                newImages.push(reader.result.toString())
                if (newImages.length === files.length) {
                  setImages(prev => [...prev, ...newImages].slice(0, 10))
                  setImageFiles(prev => [...prev, ...newImageFiles].slice(0, 10))
                }
              }
            }
            reader.readAsDataURL(file)
            newImageFiles.push(file)
          }
        })
        setError(null)
      }
      event.target.value = ''
    }

    const handleRemoveImage = (indexToRemove: number) => {
      setImages(prev => prev.filter((_, index) => index !== indexToRemove));
      setImageFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const triggerFileInput = () => {
      fileInputRef.current?.click()
    }

    const handleSubmit = async () => {
      setIsSaving(true)
      setError(null)
      setSuccess(null)
      await new Promise(resolve => setTimeout(resolve, 1500))
      setIsSaving(false)
      setSuccess("Vehicle upload simulated successfully!")
    }

    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Button variant="ghost" onClick={() => setShowVehicleUploadPage(false)} className="mb-4 -ml-2 text-primary">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Dashboard
        </Button>

        <h1 className="text-3xl font-bold mb-6 text-foreground">Upload Your Vehicle</h1>

        <div className="max-w-4xl mx-auto">
          <Card className="rounded-2xl p-6 w-full border-border bg-card">
            <p className="text-muted-foreground">Vehicle upload form content will go here, using Tabs for sections like Details, Images, Pricing.</p>
          </Card>
        </div>
      </div>
    )
  }

  if (selectedVehicle) {
    return (
      <VehicleDetails
        vehicle={selectedVehicle}
        onBack={() => setSelectedVehicle(null)}
        user={userProfileData}
      />
    )
  }

  if (showLikedCarsPage) {
    return (
      <LikedCarsPage
        likedVehicles={likedVehicles}
        onBack={() => setShowLikedCarsPage(false)}
        onViewDetails={setSelectedVehicle}
        user={userProfileData}
      />
    )
  }

  if (showProfileSettings) {
    return (
      <>
        <Header user={userProfileData} onDashboardClick={() => setShowProfileSettings(false)} transparent={false} />
        <ProfileSettings
          user={userProfileData}
          onBack={() => setShowProfileSettings(false)}
          onSave={handleProfileSave}
        />
      </>
    )
  }

  if (showVehicleUploadPage) {
    return <VehicleUploadPage />
  }

  return (
    <ThemeProvider>
      <div className="h-screen bg-background flex flex-col">
        <Header
          user={userProfileData}
          onDashboardClick={onBack}
          onShowAllCars={onShowAllCars}
          onSignOut={onSignOut}
          transparent={false}
        />

        <main className="flex-1 px-6 pb-6 overflow-auto pt-20">
          <h1 className="text-4xl font-bold mb-6">Welcome, {userProfileData.firstName}</h1>

          <div className="w-full mx-auto h-full">
            <div className="grid grid-cols-12 gap-4 h-full">
              <div className="col-span-9 grid grid-rows-[1fr_1fr] gap-4 h-full">
                <div className="grid grid-cols-3 gap-4">
                  {/* Profile Card */}
                  <div
                    onClick={() => setShowProfileSettings(true)}
                    className="block min-w-0 cursor-pointer"
                  >
                    <Card className="rounded-3xl overflow-hidden w-full h-full transition-transform hover:scale-105">
                      <div className="relative w-full h-full">
                        {userProfileData.profilePic ? (
                          <img src={userProfileData.profilePic} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-[#2E933C] flex items-center justify-center text-white">
                            <div className="text-center">
                              <div className="text-5xl font-bold mb-2">
                                {(userProfileData.firstName?.[0] || '') + (userProfileData.lastName?.[0] || '') || userProfileData.email[0].toUpperCase()}
                              </div>
                              <div className="text-sm">{userProfileData.firstName} {userProfileData.lastName}</div>
                            </div>
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent text-white">
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

                  {/* Progress Card */}
                  <Card className="rounded-3xl p-5 w-full h-full flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-xl font-semibold">Progress</h3>
                        <svg className="w-5 h-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                          const barColor = isHighlight ? "bg-yellow-400 dark:bg-yellow-500" : isWeekend ? "bg-muted" : "bg-foreground/80"

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

                  {/* Vehicle Upload Card */}
                  <div
                    onClick={() => setShowVehicleUploadPage(true)}
                    className="block min-w-0 cursor-pointer group"
                  >
                    <Card className="rounded-3xl p-5 w-full h-full flex flex-col items-center justify-center text-center transition-colors hover:bg-muted/50 border-border">
                      <div className="my-4">
                        <p className="text-muted-foreground mb-2">Ready to sell?</p>
                        <p className="text-2xl font-bold">Upload Your Vehicle</p>
                        <UploadCloud className="w-12 h-12 text-muted-foreground mx-auto mt-4" />
                      </div>
                    </Card>
                  </div>
                </div>

                {/* Calendar Section */}
                <div className="grid grid-cols-9 gap-4">
                  <Card className="col-span-3 rounded-3xl w-full h-full flex flex-col">
                    <div className="divide-y divide-border flex-1">
                      {/* ... existing calendar content ... */}
                    </div>
                  </Card>
                  <Card className="col-span-6 rounded-3xl p-5 w-full h-full flex flex-col">
                    {/* ... existing calendar content ... */}
                  </Card>
                </div>
              </div>

              {/* Right Column */}
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

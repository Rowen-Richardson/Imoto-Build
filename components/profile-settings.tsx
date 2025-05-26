"use client"

import type React from "react"
import Image from "next/image"
import { useState, useRef, useEffect, useMemo } from "react"
import { useRouter } from 'next/navigation'; // Changed from next/router to next/navigation
import { ArrowLeft, Camera, Mail, Phone, MapPin, Save, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label" // Import Label
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert" // Import Alert components
import { Header } from "@/components/ui/header"
import type { UserProfile } from "@/types/user"; // Import UserProfile from shared types

interface ProfileSettingsProps {
  user: UserProfile
  onBack: () => void
  onSave: (updatedProfile: Partial<UserProfile>) => Promise<void> // Make onSave async if it involves API calls
  onSignOut: () => void // Add onSignOut prop
}

export default function ProfileSettings({ user, onBack, onSave, onSignOut }: ProfileSettingsProps) {
  const router = useRouter();
  // Navigation handlers for Header
  const handleLogin = () => { router.push('/login'); };
  const handleDashboard = () => {
    if (user) router.push('/dashboard');
    else router.push('/login');
  };
  const handleGoHome = () => { router.push('/'); };
  const handleShowAllCars = () => {
    // This should ideally navigate to the main listing/search page, which is '/'
    // If the main page handles showing all cars by default, '/' is correct.
    router.push('/');
  };
  const handleGoToSell = () => {
    if (!user) {
      router.push(new URL('/login?next=/upload-vehicle', window.location.origin).toString());
    } else {
      router.push('/upload-vehicle'); // Navigate to the upload page if logged in
    }
  };
  const handleSignOutClick = () => {
    onSignOut();
    router.push('/login');
  };
  const [profileImage, setProfileImage] = useState<string | undefined>(user.profilePic)
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    suburb: user.suburb,
    city: user.city,
    province: user.province,
  })
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [isSavingPersonal, setIsSavingPersonal] = useState(false)
  const [isSavingSecurity, setIsSavingSecurity] = useState(false)
  const [personalError, setPersonalError] = useState<string | null>(null)
  const [securityError, setSecurityError] = useState<string | null>(null)
  const [securitySuccess, setSecuritySuccess] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Effect to reset form data if the user prop changes (e.g., after external update)
  useEffect(() => {
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      suburb: user.suburb,
      city: user.city,
      province: user.province,
    })
    setProfileImage(user.profilePic)
  }, [user])

  // --- Handlers ---
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = event.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setPersonalError(null) // Clear error on input change
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0]
    if (file) {
      // Basic validation (optional: add size/type checks)
      if (!file.type.startsWith("image/")) {
        setPersonalError("Please select a valid image file.")
        return
      }
      const reader = new FileReader()
      reader.onload = () => {
        if (reader.result) {
          const base64Image = reader.result.toString()
          setProfileImage(base64Image)
          setPersonalError(null) // Clear error on successful load
        }
      }
      reader.onerror = () => {
        setPersonalError("Failed to read image file.")
      }
      reader.readAsDataURL(file)
    }
  }

  const handleImageError = () => {
    // This handles errors if the Image component fails to load the src
    setProfileImage(undefined)
    // Optionally set an error state or log it
    console.warn("Failed to load profile image.")
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const saveSecurityChanges = async () => {
    setIsSavingSecurity(true)
    setSecurityError(null)
    setSecuritySuccess(null)

    // --- Password Change Logic ---
    if (newPassword || currentPassword) { // Only proceed if new or current password fields are touched
      if (!currentPassword) {
        setSecurityError("Please enter your current password.")
        setIsSavingSecurity(false)
        return
      }
      if (newPassword.length < 6) { // Basic length validation
        setSecurityError("New password must be at least 6 characters long.")
        setIsSavingSecurity(false)
        return
      }
      if (newPassword !== confirmPassword) {
        setSecurityError("New passwords do not match.")
        setIsSavingSecurity(false)
        return
      }

      // --- TODO: Implement actual password change API call ---
      console.log("Attempting password change...")
      console.log("Current:", currentPassword)
      console.log("New:", newPassword)
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        // Simulate success/failure
        if (currentPassword === "password123") { // Simulate correct current password
          console.log("Password change successful (simulated)")
          setSecuritySuccess("Password updated successfully!")
          // Clear password fields after successful change
          setCurrentPassword("")
          setNewPassword("")
          setConfirmPassword("")
        } else {
          throw new Error("Incorrect current password.")
        }
      } catch (error) {
        console.error("Password change failed:", error)
        setSecurityError(error instanceof Error ? error.message : "Failed to update password.")
      } finally {
        setIsSavingSecurity(false)
      }
      // --- End Simulation ---
    } else {
      // If no password fields were touched, maybe just indicate nothing to save or handle other security settings
      setIsSavingSecurity(false);
      // Optionally set a message like "No security changes to save."
    }
  }

  // Handler to save personal info
  const handleSavePersonalInfo = async () => {
    try {
      setIsSavingPersonal(true)
      setPersonalError(null)

      const updatedProfile: Partial<UserProfile> = {
        ...formData,
        profilePic: profileImage, // Include profile image in updated profile
      };

      // Call the onSave callback with updated profile data
      await onSave(updatedProfile)

      // Optionally show a success message
      alert("Profile updated successfully!")
    } catch (error) {
      console.error("Failed to save personal info:", error)
      setPersonalError("Failed to update profile. Please try again.")
    } finally {
      setIsSavingPersonal(false)
    }
  }

  // Handler for the Sign Out button click
  const handleSignOutButton = () => {
    console.log("Attempting sign out...");
    onSignOut(); // Call the parent handler
    // The parent component (CarMarketplace) should handle the actual sign-out logic
    // and potentially the navigation away from the dashboard/settings page.
    // We don't necessarily need a router.push('/login') here if the parent handles it.
    // If the parent *doesn't* handle navigation, you might add router.push('/login');
  };

  // --- Helpers ---

  // --- Render ---
  return (
    <div className="min-h-screen bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] flex flex-col">
      <Header
        user={user}
        onLoginClick={handleLogin}
        onDashboardClick={handleDashboard}
        onGoHome={handleGoHome}
        onShowAllCars={handleShowAllCars}
        onGoToSellPage={handleGoToSell}
        onSignOut={handleSignOutClick} // Use the handler that calls parent prop
        transparent={false}
      />
      <main className="flex-1 px-4 sm:px-6 pb-6 overflow-auto pt-20 md:pt-24"> {/* Adjusted padding */}
        <Button variant="ghost" onClick={onBack} className="mb-4 -ml-2 text-[#FF6700] dark:text-[#FF7D33]"> {/* Adjusted styling */}
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Dashboard
        </Button>

        <h1 className="text-3xl font-bold mb-6 text-[#3E5641] dark:text-white">Profile Settings</h1>

        <div className="max-w-6xl mx-auto">
          {/* Use flex-grow on children for equal height */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Profile Card */}
            <div className="lg:w-1/3 flex"> {/* Added flex */}
              <Card className="rounded-3xl overflow-hidden p-6 flex flex-col w-full border-[#9FA791]/20 dark:border-[#4A4D45]/20 bg-white dark:bg-[#2A352A]"> {/* Added w-full */}
                {/* Profile Image Section */}
                <div className="relative w-full aspect-square mb-4 bg-gray-200 dark:bg-gray-700 rounded-2xl flex items-center justify-center overflow-hidden">
                  {profileImage ? (
                    <Image
                      src={profileImage}
                      alt="Profile"
                      layout="fill"
                      objectFit="cover"
                      onError={handleImageError}
                      unoptimized // Keep if using base64/external URLs not configured for optimization
                      className="object-cover"
                    />
                  ) : (
                    <span className="text-5xl font-bold text-gray-500 dark:text-gray-400 select-none">
                      {getInitials(user, formData)}
                    </span>

                  )}
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute bottom-2 right-2 rounded-full p-1.5 h-8 w-8 shadow-md z-10 bg-white/80 dark:bg-black/60 hover:bg-white dark:hover:bg-black"
                    onClick={triggerFileInput}
                    aria-label="Change profile picture"
                  >
                    <Camera className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/png, image/jpeg, image/webp" // Be more specific
                      onChange={handleImageUpload}
                    />
                  </Button>
                </div>

                {/* Centered Text Content */}
                <div className="text-center flex-grow flex flex-col justify-center">
                  <h2 className="text-2xl font-bold text-[#3E5641] dark:text-white">{formData.firstName} {formData.lastName}</h2>

                  <div className="mt-4 space-y-2">
                    <div className="flex justify-center items-center text-sm text-gray-600 dark:text-gray-400">
                      <Mail className="h-4 w-4 mr-2 flex-shrink-0 text-[#6F7F69] dark:text-gray-500" />
                      <span className="truncate">{formData.email}</span>
                    </div>
                    {formData.phone && (
                      <div className="flex justify-center items-center text-sm text-gray-600 dark:text-gray-400">
                        <Phone className="h-4 w-4 mr-2 flex-shrink-0 text-[#6F7F69] dark:text-gray-500" />
                        <span>{formData.phone}</span>
                      </div>
                    )}
                    {(formData.suburb || formData.city || formData.province) && (
                      <div className="flex justify-center items-center text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="h-4 w-4 mr-2 flex-shrink-0 text-[#6F7F69] dark:text-gray-500" />
                        <span className="truncate">
                          {[formData.suburb, formData.city, formData.province]
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                    Logged in via: {user.loginMethod || 'email'}
                  </div>
                  {/* Sign Out Button */}
                  <div className="mt-6 text-center"> {/* Added margin top for spacing */}
                    <Button
                      variant="destructive" // Use destructive variant for sign out
                      onClick={handleSignOutButton} // Use the dedicated sign out button handler
                      className="w-full" // Make button full width
                    >
                      Sign Out
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Settings Tabs */}
            <div className="lg:w-2/3 flex"> {/* Added flex */}
              <Card className="rounded-3xl p-6 w-full border-[#9FA791]/20 dark:border-[#4A4D45]/20 bg-white dark:bg-[#2A352A]"> {/* Added w-full */}
                <Tabs defaultValue="personal" className="w-full flex flex-col h-full">
                  <TabsList className="grid grid-cols-2 mb-6 bg-gray-100 dark:bg-[#1F2B20] rounded-lg">
                    <TabsTrigger value="personal" className="data-[state=active]:bg-[#FF6700] dark:data-[state=active]:bg-[#FF7D33] data-[state=active]:text-white rounded-md">Personal Info</TabsTrigger>
                    <TabsTrigger value="security" className="data-[state=active]:bg-[#FF6700] dark:data-[state=active]:bg-[#FF7D33] data-[state=active]:text-white rounded-md">Security</TabsTrigger>
                  </TabsList>

                  {/* Personal Info Tab */}
                  <TabsContent value="personal" className="space-y-4 flex-grow">
                    {personalError && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{personalError}</AlertDescription>
                      </Alert>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5"> {/* Reduced space */}
                        <Label htmlFor="firstName" className="text-sm font-medium text-[#3E5641] dark:text-gray-300">First Name</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          value={formData.firstName || ""}
                          onChange={handleInputChange}
                          placeholder="Enter first name"
                          className="border-[#9FA791] dark:border-[#4A4D45] focus:border-[#FF6700] dark:focus:border-[#FF7D33] focus:ring-[#FF6700] dark:focus:ring-[#FF7D33] dark:bg-[#1F2B20] dark:text-white"
                          disabled={isSavingPersonal}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="lastName" className="text-sm font-medium text-[#3E5641] dark:text-gray-300">Last Name</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          value={formData.lastName || ""}
                          onChange={handleInputChange}
                          placeholder="Enter last name"
                          className="border-[#9FA791] dark:border-[#4A4D45] focus:border-[#FF6700] dark:focus:border-[#FF7D33] focus:ring-[#FF6700] dark:focus:ring-[#FF7D33] dark:bg-[#1F2B20] dark:text-white"
                          disabled={isSavingPersonal}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-sm font-medium text-[#3E5641] dark:text-gray-300">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email || ""}
                        onChange={handleInputChange}
                        placeholder="your@email.com"
                        disabled={user.loginMethod !== 'email' || isSavingPersonal}
                        className="border-[#9FA791] dark:border-[#4A4D45] focus:border-[#FF6700] dark:focus:border-[#FF7D33] focus:ring-[#FF6700] dark:focus:ring-[#FF7D33] dark:bg-[#1F2B20] dark:text-white disabled:opacity-70"
                      />
                      {user.loginMethod !== 'email' && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Email cannot be changed for {user.loginMethod} logins.</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="phone" className="text-sm font-medium text-[#3E5641] dark:text-gray-300">Phone (Optional)</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone || ""}
                        onChange={handleInputChange}
                        placeholder="+27 12 345 6789"
                        className="border-[#9FA791] dark:border-[#4A4D45] focus:border-[#FF6700] dark:focus:border-[#FF7D33] focus:ring-[#FF6700] dark:focus:ring-[#FF7D33] dark:bg-[#1F2B20] dark:text-white"
                        disabled={isSavingPersonal}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="suburb" className="text-sm font-medium text-[#3E5641] dark:text-gray-300">Suburb/Area (Optional)</Label>
                      <Input
                        id="suburb"
                        name="suburb"
                        value={formData.suburb || ""}
                        onChange={handleInputChange}
                        placeholder="e.g., Green Point"
                        className="border-[#9FA791] dark:border-[#4A4D45] focus:border-[#FF6700] dark:focus:border-[#FF7D33] focus:ring-[#FF6700] dark:focus:ring-[#FF7D33] dark:bg-[#1F2B20] dark:text-white"
                        disabled={isSavingPersonal}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="city" className="text-sm font-medium text-[#3E5641] dark:text-gray-300">City (Optional)</Label>
                        <Input
                          id="city"
                          name="city"
                          value={formData.city || ""}
                          onChange={handleInputChange}
                          placeholder="e.g., Cape Town"
                          className="border-[#9FA791] dark:border-[#4A4D45] focus:border-[#FF6700] dark:focus:border-[#FF7D33] focus:ring-[#FF6700] dark:focus:ring-[#FF7D33] dark:bg-[#1F2B20] dark:text-white"
                          disabled={isSavingPersonal}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="province" className="text-sm font-medium text-[#3E5641] dark:text-gray-300">Province (Optional)</Label>
                        <Input
                          id="province"
                          name="province"
                          value={formData.province || ""}
                          onChange={handleInputChange}
                          placeholder="e.g., Western Cape"
                          className="border-[#9FA791] dark:border-[#4A4D45] focus:border-[#FF6700] dark:focus:border-[#FF7D33] focus:ring-[#FF6700] dark:focus:ring-[#FF7D33] dark:bg-[#1F2B20] dark:text-white"
                          disabled={isSavingPersonal}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 mt-auto"> {/* Added mt-auto */}
                      <Button
                        onClick={handleSavePersonalInfo}
                        disabled={isSavingPersonal} // Use the correct saving state
                        className="bg-[#FF6700] text-white hover:bg-[#FF6700]/90 dark:bg-[#FF7D33] dark:hover:bg-[#FF7D33]/90"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {isSavingPersonal ? "Saving..." : "Save Personal Info"}
                      </Button>
                    </div>
                  </TabsContent>

                  {/* Security Tab */}
                  <TabsContent value="security" className="space-y-6 flex-grow flex flex-col"> {/* Added flex flex-col */}
                    {securityError && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{securityError}</AlertDescription>
                      </Alert>
                    )}
                     {securitySuccess && (
                      <Alert className="bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700 text-green-800 dark:text-green-200">
                        <AlertCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <AlertDescription>{securitySuccess}</AlertDescription>
                      </Alert>
                    )}
                    {user.loginMethod === 'email' ? (
                      <>
                        <h3 className="text-lg font-semibold border-b border-[#9FA791]/20 dark:border-[#4A4D45]/20 pb-2 text-[#3E5641] dark:text-white">Change Password</h3>
                        <div className="space-y-3"> {/* Increased spacing */}
                          <div className="space-y-1.5">
                            <Label htmlFor="currentPassword" className="text-sm font-medium text-[#3E5641] dark:text-gray-300">Current Password</Label>
                            <Input
                              id="currentPassword"
                              type="password"
                              name="currentPassword"
                              value={currentPassword}
                              onChange={(e) => { setCurrentPassword(e.target.value); setSecurityError(null); setSecuritySuccess(null); }}
                              className="border-[#9FA791] dark:border-[#4A4D45] focus:border-[#FF6700] dark:focus:border-[#FF7D33] focus:ring-[#FF6700] dark:focus:ring-[#FF7D33] dark:bg-[#1F2B20] dark:text-white"
                              disabled={isSavingSecurity}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="newPassword" className="text-sm font-medium text-[#3E5641] dark:text-gray-300">New Password</Label>
                            <Input
                              id="newPassword"
                              type="password"
                              name="newPassword"
                              value={newPassword}
                              onChange={(e) => { setNewPassword(e.target.value); setSecurityError(null); setSecuritySuccess(null); }}
                              className="border-[#9FA791] dark:border-[#4A4D45] focus:border-[#FF6700] dark:focus:border-[#FF7D33] focus:ring-[#FF6700] dark:focus:ring-[#FF7D33] dark:bg-[#1F2B20] dark:text-white"
                              disabled={isSavingSecurity}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="confirmPassword" className="text-sm font-medium text-[#3E5641] dark:text-gray-300">Confirm New Password</Label>
                            <Input
                              id="confirmPassword"
                              type="password"
                              name="confirmPassword"
                              value={confirmPassword}
                              onChange={(e) => { setConfirmPassword(e.target.value); setSecurityError(null); setSecuritySuccess(null); }}
                              className="border-[#9FA791] dark:border-[#4A4D45] focus:border-[#FF6700] dark:focus:border-[#FF7D33] focus:ring-[#FF6700] dark:focus:ring-[#FF7D33] dark:bg-[#1F2B20] dark:text-white"
                              disabled={isSavingSecurity}
                            />
                          </div>
                        </div>
                        <div className="flex justify-end pt-4">
                          <Button
                            onClick={saveSecurityChanges}
                            disabled={isSavingSecurity || (!currentPassword && !newPassword)} // Disable if saving or no password fields touched
                            className="bg-[#FF6700] text-white hover:bg-[#FF6700]/90 dark:bg-[#FF7D33] dark:hover:bg-[#FF7D33]/90"
                          >
                            <Save className="h-4 w-4 mr-2" />
                            {isSavingSecurity ? "Updating..." : "Update Password"}
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="p-4 border rounded-lg bg-gray-50 dark:bg-[#1F2B20]">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Password management is handled through your {user.loginMethod} account.
                        </p>
                      </div>
                    )}

                    {/* Other Security Settings */}
                    <div className="space-y-4 pt-4 mt-auto"> {/* Added mt-auto */}
                       <h3 className="text-lg font-semibold border-b border-[#9FA791]/20 dark:border-[#4A4D45]/20 pb-2 text-[#3E5641] dark:text-white">Account Security</h3>
                       <div className="flex items-center justify-between p-4 border border-[#9FA791]/20 dark:border-[#4A4D45]/20 rounded-lg bg-gray-50 dark:bg-[#1F2B20]">
                         <div>
                           <p className="font-medium text-[#3E5641] dark:text-white">Two-Factor Authentication</p>
                           <p className="text-sm text-gray-500 dark:text-gray-400">Add an extra layer of security (Not implemented).</p>
                         </div>
                         <Button variant="outline" disabled>Enable</Button>
                       </div>
                       {/* Login Sessions Placeholder */}
                       <div className="space-y-2">
                         <h4 className="font-medium text-[#3E5641] dark:text-white">Login Sessions (Placeholder)</h4>
                         <div className="p-4 border border-[#9FA791]/20 dark:border-[#4A4D45]/20 rounded-lg space-y-3 bg-gray-50 dark:bg-[#1F2B20]">
                           {/* Content goes here */}
                         </div>
                       </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

// Helper function to get initials (moved outside the component)
const getInitials = (user: UserProfile | null, formData: Partial<UserProfile>) => {
  return (
    (formData.firstName?.[0] || "") + (formData.lastName?.[0] || "") || user?.email?.[0] || ""
  ).toUpperCase();
};

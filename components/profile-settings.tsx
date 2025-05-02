"use client"

import type React from "react"
import Image from "next/image"
import { useState, useRef } from "react"
import { ArrowLeft, Camera, Mail, Phone, MapPin, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { UserProfile } from "@/lib/data"

interface ProfileSettingsProps {
  user: UserProfile
  onBack: () => void
  onSave: (updatedProfile: Partial<UserProfile>) => void // Keep this prop
}

export default function ProfileSettings({ user, onBack, onSave }: ProfileSettingsProps) {
  const [profileImage, setProfileImage] = useState<string | undefined>(user.profilePic)
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone, // Ensure phone is included if it exists
    suburb: user.suburb,
    city: user.city,
    province: user.province,
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        if (reader.result) {
          const base64Image = reader.result.toString()
          setProfileImage(base64Image)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleImageError = () => {
    setProfileImage(undefined)
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const saveChanges = () => {
    const updatedProfile: Partial<UserProfile> = {
      ...formData,
    }
    // Only include profilePic if it has changed from the original or if it was initially undefined and now has a value
    if (profileImage !== user.profilePic) {
       updatedProfile.profilePic = profileImage // Send the new base64 data or undefined
    }

    // TODO: Add password change logic if needed

    onSave(updatedProfile) // Call the onSave prop passed from Dashboard
  }

  const getInitials = () => {
    return (
      (formData.firstName?.[0] || "") + (formData.lastName?.[0] || "") || formData.email?.[0] || ""
    ).toUpperCase()
  }

  return (
    <main className="flex-1 px-6 pb-6 overflow-auto pt-20">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Dashboard
      </Button>

      <h1 className="text-3xl font-bold mb-6">Profile Settings</h1>

      <div className="max-w-6xl mx-auto">
        {/* Ensure flex container allows children to stretch on large screens */}
        <div className="flex flex-col lg:flex-row gap-6 lg:items-stretch">
          {/* Profile Card - Adjusted width and height */}
          <div className="lg:w-1/3">
            {/* Added lg:h-full */}
            <Card className="rounded-3xl overflow-hidden p-6 flex flex-col lg:h-full">
              {/* New Square Profile Image Section */}
              <div className="relative w-full h-48 mb-4 bg-gray-200 dark:bg-gray-700 rounded-2xl flex items-center justify-center overflow-hidden">
                {profileImage ? (
                  <Image
                    src={profileImage}
                    alt="Profile"
                    layout="fill" // Use layout fill to cover the container
                    objectFit="cover" // Cover the area
                    className="object-cover" // Ensure Tailwind object-cover is applied
                    onError={handleImageError}
                    unoptimized
                  />
                ) : (
                  <span className="text-5xl font-bold text-gray-700 dark:text-gray-300">
                    {getInitials()}
                  </span>
                )}
                {/* Camera Button positioned relative to the square */}
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute bottom-2 right-2 rounded-full p-1.5 h-8 w-8 shadow-md z-10" // Added z-index
                  onClick={triggerFileInput}
                >
                  <Camera className="h-4 w-4" />
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </Button>
              </div>

              {/* Centered Text Content */}
              <div className="text-center flex-grow flex flex-col justify-center">
                {/* Display name using formData for immediate reflection */}
                <h2 className="text-2xl font-bold">{formData.firstName} {formData.lastName}</h2>

                {/* Display details using formData */}
                <div className="flex justify-center items-center mt-4 space-x-4">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Mail className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span className="truncate">{formData.email}</span>
                  </div>
                </div>
                {formData.phone && (
                  <div className="flex justify-center items-center mt-2 space-x-4">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Phone className="h-4 w-4 mr-1 flex-shrink-0" />
                      <span>{formData.phone}</span>
                    </div>
                  </div>
                )}
                {(formData.suburb || formData.city || formData.province) && (
                  <div className="flex justify-center items-center mt-2 space-x-4">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                      <span>
                        {[formData.suburb, formData.city, formData.province]
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    </div>
                  </div>
                )}
                <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                  Logged in via: {user.loginMethod || 'email'}
                </div>
              </div>
            </Card>
          </div>

          {/* Settings Tabs - Adjusted width and height */}
          <div className="lg:w-2/3">
            {/* Added lg:h-full */}
            <Card className="rounded-3xl p-6 lg:h-full">
              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid grid-cols-2 mb-6">
                  <TabsTrigger value="personal">Personal Info</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="space-y-4">
                  {/* Input fields remain the same */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="firstName" className="text-sm font-medium">First Name</label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName || ""}
                        onChange={handleInputChange}
                        placeholder="Enter first name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="lastName" className="text-sm font-medium">Last Name</label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName || ""}
                        onChange={handleInputChange}
                        placeholder="Enter last name"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">Email</label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email || ""}
                      onChange={handleInputChange}
                      placeholder="your@email.com"
                      disabled={user.loginMethod !== 'email'}
                    />
                     {user.loginMethod !== 'email' && (
                       <p className="text-xs text-gray-500 dark:text-gray-400">Email cannot be changed for {user.loginMethod} logins.</p>
                     )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-medium">Phone (Optional)</label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone || ""}
                      onChange={handleInputChange}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="suburb" className="text-sm font-medium">Suburb/Area (Optional)</label>
                    <Input
                      id="suburb"
                      name="suburb"
                      value={formData.suburb || ""}
                      onChange={handleInputChange}
                      placeholder="e.g., Green Point"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="city" className="text-sm font-medium">City (Optional)</label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city || ""}
                        onChange={handleInputChange}
                        placeholder="e.g., Cape Town"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="province" className="text-sm font-medium">Province (Optional)</label>
                      <Input
                        id="province"
                        name="province"
                        value={formData.province || ""}
                        onChange={handleInputChange}
                        placeholder="e.g., Western Cape"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button onClick={saveChanges}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Personal Info
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="security" className="space-y-4">
                  {/* Security content remains the same */}
                  {user.loginMethod === 'email' ? (
                    <>
                      <h3 className="text-lg font-semibold border-b pb-2">Change Password</h3>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Current Password</label>
                        <Input type="password" name="currentPassword" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">New Password</label>
                        <Input type="password" name="newPassword" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Confirm New Password</label>
                        <Input type="password" name="confirmPassword" />
                      </div>
                      <div className="flex justify-end pt-4">
                        <Button onClick={() => alert("Password change not implemented yet.")}>
                          <Save className="h-4 w-4 mr-2" />
                          Update Password
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Password management is handled through your {user.loginMethod} account.
                      </p>
                    </div>
                  )}

                  <h3 className="text-lg font-semibold border-b pb-2 pt-4">Account Security</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Two-Factor Authentication</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Add an extra layer of security (Not implemented).</p>
                      </div>
                      <Button variant="outline" disabled>Enable</Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Login Sessions (Placeholder)</h4>
                    <div className="p-4 border rounded-lg space-y-3">
                      {/* Placeholder content */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Current Session</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Location • Browser on OS</p>
                        </div>
                        <div className="text-sm text-green-600 font-medium">Active Now</div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Previous Session</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Location • Browser on OS</p>
                        </div>
                        <div className="text-sm text-gray-500">Timestamp</div>
                      </div>
                       <Button variant="outline" size="sm" className="mt-2" disabled>Sign out all other sessions</Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}

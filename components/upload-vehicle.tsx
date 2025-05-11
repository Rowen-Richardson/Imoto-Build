"use client"

import type React from "react"
import Image from "next/image"
import { useState, useRef, useEffect } from "react"
import { ArrowLeft, Camera, Save, AlertCircle, XCircle, Edit, Check, Grip } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { UserProfile } from "@/types/user"

interface UploadVehicleProps {
  user: UserProfile // User who is uploading
  onBack: () => void // Callback to go back
  onVehicleSubmit: (vehicleData: any) => Promise<void> // Callback to submit vehicle data
  onSaveProfile?: (updatedProfile: Partial<UserProfile>) => Promise<void> // Callback to save profile changes
}

// Define engine capacity options
const engineCapacityOptions = [
  { value: "1.0-1.5", label: "1.0L - 1.5L" },
  { value: "1.6-2.0", label: "1.6L - 2.0L" },
  { value: "2.1-3.0", label: "2.1L - 3.0L" },
  { value: "3.1+", label: "3.1L+" },
]

// Define body type options with icons
const bodyTypeOptions = [
  { value: "Sedan", label: "Sedan", icon: "car" },
  { value: "SUV", label: "SUV", icon: "car" },
  { value: "Truck", label: "Truck", icon: "truck" },
  { value: "Motorcycle", label: "Motorcycle", icon: "bike" },
  { value: "Hatchback", label: "Hatchback", icon: "car" },
  { value: "Convertible", label: "Convertible", icon: "car" },
]

export default function UploadVehicle({ user, onBack, onVehicleSubmit, onSaveProfile }: UploadVehicleProps) {
  // --- State ---
  const [vehicleImages, setVehicleImages] = useState<string[]>([])
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null)
  const [isCustomEngineCapacity, setIsCustomEngineCapacity] = useState(false)

  const [formData, setFormData] = useState({
    make: "",
    model: "",
    year: "",
    price: "",
    mileage: "",
    transmission: "",
    fuel: "",
    engineCapacity: "",
    bodyType: "",
    variant: "",
    description: "",
    sellerName: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email.split("@")[0],
    sellerEmail: user.email,
    sellerPhone: user.phone || "",
  })

  // State for seller info editing
  const [isEditingSeller, setIsEditingSeller] = useState(false)
  const [sellerFormData, setSellerFormData] = useState({
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    phone: user.phone || "",
    suburb: user.suburb || "",
    city: user.city || "",
    province: user.province || "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Effect to update seller info in formData if user profile changes externally
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      sellerName: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email.split("@")[0],
      sellerEmail: user.email,
      sellerPhone: user.phone || "",
    }))

    setSellerFormData({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      phone: user.phone || "",
      suburb: user.suburb || "",
      city: user.city || "",
      province: user.province || "",
    })
  }, [user])

  // --- Handlers ---
  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ): void => {
    const { name, value } = event.target

    // Special handling for engine capacity
    if (name === "engineCapacity" && event.target.id === "engineCapacity" && value === "custom") {
      setIsCustomEngineCapacity(true)
      return // Don't update formData yet
    } else if (name === "engineCapacity") {
      setIsCustomEngineCapacity(false)
    }

    setFormData((prev) => ({ ...prev, [name]: value }))
    setSubmitError(null) // Clear error on input change
  }

  const handleSellerInputChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = event.target
    setSellerFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Ensure that changes in UploadVehicle are propagated to ProfileSettings via the onSaveProfile callback.
  const handleSaveSellerInfo = async () => {
    try {
      // Create updated user profile data
      const updatedProfile: Partial<UserProfile> = {
        firstName: sellerFormData.firstName,
        lastName: sellerFormData.lastName,
        phone: sellerFormData.phone,
        suburb: sellerFormData.suburb,
        city: sellerFormData.city,
        province: sellerFormData.province,
      }

      // Refined immediate update for sellerName for local UI responsiveness
      const newSellerName =
        sellerFormData.firstName && sellerFormData.lastName
          ? `${sellerFormData.firstName} ${sellerFormData.lastName}`
          : sellerFormData.firstName || sellerFormData.lastName
          ? `${sellerFormData.firstName || ""}${sellerFormData.firstName && sellerFormData.lastName ? " " : ""}${sellerFormData.lastName || ""}`.trim()
          : user.email.split("@")[0]; // Fallback to current user prop's email if both are empty in form

      // Update the seller info in the form data
      setFormData((prev) => ({
        ...prev,
        sellerName: newSellerName,
        sellerPhone: sellerFormData.phone, // Use the latest from the seller edit form
      }))

      // Call the onSaveProfile callback to update the user profile
      if (onSaveProfile) {
        await onSaveProfile(updatedProfile)
      }

      setIsEditingSeller(false)
    } catch (error) {
      console.error("Failed to save seller info:", error)
      setSubmitError("Failed to update seller information. Please try again.")
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const files = event.target.files
    if (files) {
      const newImages: string[] = []
      const errors: string[] = []

      // Check total number of images
      if (vehicleImages.length + files.length > 21) {
        setSubmitError(`You can upload a maximum of 21 images. You have ${vehicleImages.length} already.`)
        // Clear the input value so the same files can be selected again if needed
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
        return
      }

      Array.from(files).forEach((file) => {
        if (!file.type.startsWith("image/")) {
          errors.push(`File "${file.name}" is not a valid image.`)
          return
        }
        // Optional: Add size check here (e.g., file.size > 5 * 1024 * 1024 for 5MB limit)

        const reader = new FileReader()
        reader.onload = () => {
          if (reader.result) {
            newImages.push(reader.result.toString())
            // If all files are processed, update state
            if (newImages.length + vehicleImages.length === vehicleImages.length + files.length - errors.length) {
              setVehicleImages((prevImages) => [...prevImages, ...newImages])
              setSubmitError(errors.length > 0 ? errors.join(" ") : null) // Show errors if any
              // Clear the input value so the same files can be selected again if needed
              if (fileInputRef.current) {
                fileInputRef.current.value = ""
              }
            }
          } else {
            errors.push(`Failed to read file "${file.name}".`)
            setSubmitError(errors.join(" "))
            // Clear the input value
            if (fileInputRef.current) {
              fileInputRef.current.value = ""
            }
          }
        }
        reader.onerror = () => {
          errors.push(`Failed to read file "${file.name}".`)
          setSubmitError(errors.join(" "))
          // Clear the input value
          if (fileInputRef.current) {
            fileInputRef.current.value = ""
          }
        }
        reader.readAsDataURL(file)
      })
      setSubmitError(errors.length > 0 ? errors.join(" ") : null) // Show errors immediately for invalid files
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const handleRemoveImage = (index: number) => {
    setVehicleImages((prevImages) => prevImages.filter((_, i) => i !== index))
    setSubmitError(null) // Clear error if removing images might fix min count
  }

  // Drag and drop handlers for image reordering
  const handleDragStart = (index: number) => {
    setIsDragging(true)
    setDraggedIndex(index)
  }

  const handleDragEnter = (index: number) => {
    if (draggedIndex !== null && draggedIndex !== index) {
      setDropTargetIndex(index)
    }
  }

  const handleDragEnd = () => {
    if (draggedIndex !== null && dropTargetIndex !== null) {
      // Reorder the images
      const newImages = [...vehicleImages]
      const [draggedImage] = newImages.splice(draggedIndex, 1)
      newImages.splice(dropTargetIndex, 0, draggedImage)
      setVehicleImages(newImages)
    }

    // Reset drag state
    setIsDragging(false)
    setDraggedIndex(null)
    setDropTargetIndex(null)
  }

  const handleSubmitVehicle = async () => {
    setIsSubmitting(true)
    setSubmitError(null)
    setSubmitSuccess(null)

    // Basic validation
    if (
      !formData.make ||
      !formData.model ||
      !formData.year ||
      !formData.price ||
      !formData.mileage ||
      !formData.transmission ||
      !formData.fuel ||
      !formData.engineCapacity
    ) {
      setSubmitError("Please fill in all required fields.")
      setIsSubmitting(false)
      return
    }

    // Image count validation
    if (vehicleImages.length < 5) {
      setSubmitError(`Please upload at least 5 images. You have ${vehicleImages.length}.`)
      setIsSubmitting(false)
      return
    }
    if (vehicleImages.length > 21) {
      setSubmitError(`You can upload a maximum of 21 images. You have ${vehicleImages.length}.`)
      setIsSubmitting(false)
      return
    }

    try {
      // Prepare data for submission
      const vehicleData = {
        ...formData,
        images: vehicleImages, // Include the array of base64 image data
        // Add any other necessary fields like sellerId from user object
        sellerId: user.id, // Assuming user object has an id
      }

      // Call the onVehicleSubmit prop to submit the vehicle data
      await onVehicleSubmit(vehicleData)

      setSubmitSuccess("Vehicle listed successfully!")
      // Optionally clear form or navigate back after success
      // setFormData({ ...initial empty state... });
      // setVehicleImages([]);
      // onBack(); // Navigate back after successful submission
    } catch (error) {
      console.error("Failed to submit vehicle:", error)
      setSubmitError(error instanceof Error ? error.message : "Failed to list vehicle.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // --- Render ---
  return (
    <div className="min-h-screen bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] flex flex-col">
      {/* Header is rendered by the parent (CarMarketplace) */}
      <main className="flex-1 px-4 sm:px-6 pb-6 overflow-auto pt-20 md:pt-24">
        <Button variant="ghost" onClick={onBack} className="mb-4 -ml-2 text-[#FF6700] dark:text-[#FF7D33]">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Dashboard
        </Button>

        <h1 className="text-3xl font-bold mb-6 text-[#3E5641] dark:text-white">List Your Vehicle</h1>

        <div className="max-w-6xl mx-auto">
          {submitError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          {submitSuccess && (
            <Alert className="bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700 text-green-800 dark:text-green-200 mb-4">
              <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription>{submitSuccess}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Column - Image Upload and Preview */}
            <div className="lg:w-1/3 flex flex-col">
              <Card className="rounded-3xl overflow-hidden p-6 flex flex-col w-full border-[#9FA791]/20 dark:border-[#4A4D45]/20 bg-white dark:bg-[#2A352A] mb-6">
                <h2 className="text-xl font-bold mb-4 text-[#3E5641] dark:text-white">Vehicle Images</h2>

                {/* Main Image Preview */}
                <div
                  className="relative w-full aspect-video mb-4 bg-gray-200 dark:bg-gray-700 rounded-2xl flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={triggerFileInput}
                >
                  {vehicleImages.length > 0 ? (
                    <Image
                      src={vehicleImages[0] || "/placeholder.svg"} // Display the first image as the main preview
                      alt="Vehicle main preview"
                      layout="fill"
                      objectFit="cover"
                      unoptimized
                      className="object-cover"
                    />
                  ) : (
                    <div className="text-center text-gray-500 dark:text-gray-400">
                      <Camera className="w-12 h-12 mx-auto mb-2" />
                      <span className="text-xl font-bold">Upload Vehicle Images</span>
                      <p className="text-sm mt-1">(Min 5, Max 21)</p>
                    </div>
                  )}

                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute bottom-2 right-2 rounded-full p-1.5 h-8 w-8 shadow-md z-10 bg-white/80 dark:bg-black/60 hover:bg-white dark:hover:bg-black"
                    onClick={(e) => {
                      e.stopPropagation()
                      triggerFileInput()
                    }}
                    aria-label="Upload vehicle images"
                  >
                    <Camera className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/png, image/jpeg, image/webp"
                      multiple
                      onChange={handleImageUpload}
                    />
                  </Button>
                </div>

                {/* Image Gallery with Drag and Drop */}
                {vehicleImages.length > 0 && (
                  <div className="mt-2">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg font-semibold text-[#3E5641] dark:text-white">
                        Gallery ({vehicleImages.length})
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Drag to reorder • First image is main</p>
                    </div>

                    <div className="grid grid-cols-3 gap-3 max-h-60 overflow-y-auto p-1">
                      {vehicleImages.map((image, index) => (
                        <div
                          key={index}
                          className={`relative aspect-square overflow-hidden rounded-lg group cursor-move
                            ${draggedIndex === index ? "opacity-50 scale-95" : ""}
                            ${dropTargetIndex === index ? "ring-2 ring-[#FF6700] dark:ring-[#FF7D33]" : ""}
                          `}
                          draggable
                          onDragStart={() => handleDragStart(index)}
                          onDragEnter={() => handleDragEnter(index)}
                          onDragOver={(e) => e.preventDefault()}
                          onDragEnd={handleDragEnd}
                        >
                          <div className="absolute inset-0 flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 bg-black/20 transition-opacity">
                            <Grip className="w-5 h-5 text-white" />
                          </div>
                          <Image
                            src={image || "/placeholder.svg"}
                            alt={`Vehicle image ${index + 1}`}
                            layout="fill"
                            objectFit="cover"
                            unoptimized
                            className="object-cover"
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRemoveImage(index)
                            }}
                            className="absolute top-1 right-1 bg-red-500/80 hover:bg-red-600/90 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-20"
                            aria-label={`Remove image ${index + 1}`}
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                          {index === 0 && (
                            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs py-1 text-center">
                              Main Image
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>

              {/* Seller Information Card */}
              <Card className="rounded-3xl overflow-hidden p-6 flex flex-col w-full border-[#9FA791]/20 dark:border-[#4A4D45]/20 bg-white dark:bg-[#2A352A]">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-[#3E5641] dark:text-white">Seller Information</h2>
                  {!isEditingSeller ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[#FF6700] dark:text-[#FF7D33]"
                      onClick={() => setIsEditingSeller(true)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-green-600 dark:text-green-400"
                      onClick={handleSaveSellerInfo}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  {!isEditingSeller ? (
                    // Display mode
                    <>
                      <div className="flex flex-col">
                        <Label className="text-sm font-medium text-[#6F7F69] dark:text-gray-400 mb-1">Name</Label>
                        <div className="text-[#3E5641] dark:text-white font-medium">
                          {formData.sellerName || "Not provided"}
                        </div>
                      </div>

                      <div className="flex flex-col">
                        <Label className="text-sm font-medium text-[#6F7F69] dark:text-gray-400 mb-1">Email</Label>
                        <div className="text-[#3E5641] dark:text-white font-medium">{formData.sellerEmail}</div>
                      </div>

                      <div className="flex flex-col">
                        <Label className="text-sm font-medium text-[#6F7F69] dark:text-gray-400 mb-1">Phone</Label>
                        <div className="text-[#3E5641] dark:text-white font-medium">
                          {formData.sellerPhone || "Not provided"}
                        </div>
                      </div>

                      <div className="flex flex-col">
                        <Label className="text-sm font-medium text-[#6F7F69] dark:text-gray-400 mb-1">Location</Label>
                        <div className="text-[#3E5641] dark:text-white font-medium">
                          {user.suburb && `${user.suburb}, `}
                          {user.city && `${user.city}, `}
                          {user.province || "Not provided"}
                        </div>
                      </div>
                    </>
                  ) : (
                    // Edit mode
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="firstName" className="text-sm font-medium text-[#3E5641] dark:text-gray-300">
                            First Name
                          </Label>
                          <Input
                            id="firstName"
                            name="firstName"
                            value={sellerFormData.firstName}
                            onChange={handleSellerInputChange}
                            placeholder="First Name"
                            className="border-[#9FA791] dark:border-[#4A4D45] focus:border-[#FF6700] dark:focus:border-[#FF7D33] focus:ring-[#FF6700] dark:focus:ring-[#FF7D33] dark:bg-[#1F2B20] dark:text-white"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="lastName" className="text-sm font-medium text-[#3E5641] dark:text-gray-300">
                            Last Name
                          </Label>
                          <Input
                            id="lastName"
                            name="lastName"
                            value={sellerFormData.lastName}
                            onChange={handleSellerInputChange}
                            placeholder="Last Name"
                            className="border-[#9FA791] dark:border-[#4A4D45] focus:border-[#FF6700] dark:focus:border-[#FF7D33] focus:ring-[#FF6700] dark:focus:ring-[#FF7D33] dark:bg-[#1F2B20] dark:text-white"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="phone" className="text-sm font-medium text-[#3E5641] dark:text-gray-300">
                          Phone Number
                        </Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={sellerFormData.phone}
                          onChange={handleSellerInputChange}
                          placeholder="+27 12 345 6789"
                          className="border-[#9FA791] dark:border-[#4A4D45] focus:border-[#FF6700] dark:focus:border-[#FF7D33] focus:ring-[#FF6700] dark:focus:ring-[#FF7D33] dark:bg-[#1F2B20] dark:text-white"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="email" className="text-sm font-medium text-[#3E5641] dark:text-gray-300">
                          Email
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={user.email}
                          disabled
                          className="opacity-70 border-[#9FA791] dark:border-[#4A4D45] dark:bg-[#1F2B20] dark:text-white"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400">Email cannot be changed</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="suburb" className="text-sm font-medium text-[#3E5641] dark:text-gray-300">
                            Suburb
                          </Label>
                          <Input
                            id="suburb"
                            name="suburb"
                            value={sellerFormData.suburb || ""}
                            onChange={handleSellerInputChange}
                            placeholder="Suburb"
                            className="border-[#9FA791] dark:border-[#4A4D45] focus:border-[#FF6700] dark:focus:border-[#FF7D33] focus:ring-[#FF6700] dark:focus:ring-[#FF7D33] dark:bg-[#1F2B20] dark:text-white"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="city" className="text-sm font-medium text-[#3E5641] dark:text-gray-300">
                            City
                          </Label>
                          <Input
                            id="city"
                            name="city"
                            value={sellerFormData.city || ""}
                            onChange={handleSellerInputChange}
                            placeholder="City"
                            className="border-[#9FA791] dark:border-[#4A4D45] focus:border-[#FF6700] dark:focus:border-[#FF7D33] focus:ring-[#FF6700] dark:focus:ring-[#FF7D33] dark:bg-[#1F2B20] dark:text-white"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="province" className="text-sm font-medium text-[#3E5641] dark:text-gray-300">
                          Province
                        </Label>
                        <select
                          id="province"
                          name="province"
                          value={sellerFormData.province || ""}
                          onChange={handleSellerInputChange}
                          className="w-full px-3 py-2 rounded-lg border border-[#9FA791] dark:border-[#4A4D45] focus:outline-none focus:border-[#FF6700] dark:focus:border-[#FF7D33] appearance-none bg-white dark:bg-[#2A352A] text-[#3E5641] dark:text-white"
                        >
                          <option value="">Select Province</option>
                          <option value="Eastern Cape">Eastern Cape</option>
                          <option value="Free State">Free State</option>
                          <option value="Gauteng">Gauteng</option>
                          <option value="KwaZulu-Natal">KwaZulu-Natal</option>
                          <option value="Limpopo">Limpopo</option>
                          <option value="Mpumalanga">Mpumalanga</option>
                          <option value="North West">North West</option>
                          <option value="Northern Cape">Northern Cape</option>
                          <option value="Western Cape">Western Cape</option>
                        </select>
                      </div>
                    </>
                  )}
                </div>

                <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                  This information will be visible to potential buyers.
                </p>
              </Card>
            </div>

            {/* Right Column - Vehicle Details Form */}
            <div className="lg:w-2/3 flex">
              <Card className="rounded-3xl p-6 w-full border-[#9FA791]/20 dark:border-[#4A4D45]/20 bg-white dark:bg-[#2A352A]">
                <h2 className="text-xl font-bold mb-6 text-[#3E5641] dark:text-white">Vehicle Details</h2>

                <div className="space-y-6">
                  {/* Basic Information Section */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-[#3E5641] dark:text-white">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="make" className="text-sm font-medium text-[#3E5641] dark:text-gray-300">
                          Make
                        </Label>
                        <Input
                          id="make"
                          name="make"
                          value={formData.make}
                          onChange={handleInputChange}
                          placeholder="e.g., Toyota"
                          className="border-[#9FA791] dark:border-[#4A4D45] focus:border-[#FF6700] dark:focus:border-[#FF7D33] focus:ring-[#FF6700] dark:focus:ring-[#FF7D33] dark:bg-[#1F2B20] dark:text-white"
                          disabled={isSubmitting}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="model" className="text-sm font-medium text-[#3E5641] dark:text-gray-300">
                          Model
                        </Label>
                        <Input
                          id="model"
                          name="model"
                          value={formData.model}
                          onChange={handleInputChange}
                          placeholder="e.g., Corolla"
                          className="border-[#9FA791] dark:border-[#4A4D45] focus:border-[#FF6700] dark:focus:border-[#FF7D33] focus:ring-[#FF6700] dark:focus:ring-[#FF7D33] dark:bg-[#1F2B20] dark:text-white"
                          disabled={isSubmitting}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="variant" className="text-sm font-medium text-[#3E5641] dark:text-gray-300">
                          Variant (Optional)
                        </Label>
                        <Input
                          id="variant"
                          name="variant"
                          value={formData.variant}
                          onChange={handleInputChange}
                          placeholder="e.g., 1.4 TSI"
                          className="border-[#9FA791] dark:border-[#4A4D45] focus:border-[#FF6700] dark:focus:border-[#FF7D33] focus:ring-[#FF6700] dark:focus:ring-[#FF7D33] dark:bg-[#1F2B20] dark:text-white"
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Price, Mileage, and Year Section */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-[#3E5641] dark:text-white">Price, Mileage & Year</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="price" className="text-sm font-medium text-[#3E5641] dark:text-gray-300">
                          Price (ZAR)
                        </Label>
                        <Input
                          id="price"
                          name="price"
                          type="number"
                          value={formData.price}
                          onChange={handleInputChange}
                          placeholder="e.g., 150000"
                          className="border-[#9FA791] dark:border-[#4A4D45] focus:border-[#FF6700] dark:focus:border-[#FF7D33] focus:ring-[#FF6700] dark:focus:ring-[#FF7D33] dark:bg-[#1F2B20] dark:text-white"
                          disabled={isSubmitting}
                          min="0"
                          step="1000"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="mileage" className="text-sm font-medium text-[#3E5641] dark:text-gray-300">
                          Mileage (km)
                        </Label>
                        <Input
                          id="mileage"
                          name="mileage"
                          type="number"
                          value={formData.mileage}
                          onChange={handleInputChange}
                          placeholder="e.g., 50000"
                          className="border-[#9FA791] dark:border-[#4A4D45] focus:border-[#FF6700] dark:focus:border-[#FF7D33] focus:ring-[#FF6700] dark:focus:ring-[#FF7D33] dark:bg-[#1F2B20] dark:text-white"
                          disabled={isSubmitting}
                          min="0"
                          step="1000"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="year" className="text-sm font-medium text-[#3E5641] dark:text-gray-300">
                          Year
                        </Label>
                        <Input
                          id="year"
                          name="year"
                          type="number"
                          value={formData.year}
                          onChange={handleInputChange}
                          placeholder="e.g., 2020"
                          className="border-[#9FA791] dark:border-[#4A4D45] focus:border-[#FF6700] dark:focus:border-[#FF7D33] focus:ring-[#FF6700] dark:focus:ring-[#FF7D33] dark:bg-[#1F2B20] dark:text-white"
                          disabled={isSubmitting}
                          min="1900"
                          max={new Date().getFullYear().toString()}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Technical Specifications Section */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-[#3E5641] dark:text-white">
                      Technical Specifications
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="transmission" className="text-sm font-medium text-[#3E5641] dark:text-gray-300">
                          Transmission
                        </Label>
                        <select
                          id="transmission"
                          name="transmission"
                          value={formData.transmission}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 rounded-lg border border-[#9FA791] dark:border-[#4A4D45] focus:outline-none focus:border-[#FF6700] dark:focus:border-[#FF7D33] appearance-none bg-white dark:bg-[#2A352A] text-[#3E5641] dark:text-white"
                          disabled={isSubmitting}
                        >
                          <option value="">Select Transmission</option>
                          <option value="Manual">Manual</option>
                          <option value="Automatic">Automatic</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="fuel" className="text-sm font-medium text-[#3E5641] dark:text-gray-300">
                          Fuel Type
                        </Label>
                        <select
                          id="fuel"
                          name="fuel"
                          value={formData.fuel}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 rounded-lg border border-[#9FA791] dark:border-[#4A4D45] focus:outline-none focus:border-[#FF6700] dark:focus:border-[#FF7D33] appearance-none bg-white dark:bg-[#2A352A] text-[#3E5641] dark:text-white"
                          disabled={isSubmitting}
                        >
                          <option value="">Select Fuel Type</option>
                          <option value="Petrol">Petrol</option>
                          <option value="Diesel">Diesel</option>
                          <option value="Electric">Electric</option>
                          <option value="Hybrid">Hybrid</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <Label
                          htmlFor="engineCapacity"
                          className="text-sm font-medium text-[#3E5641] dark:text-gray-300"
                        >
                          Engine Capacity
                        </Label>
                        <div className="flex flex-col space-y-2">
                          <select
                            id="engineCapacity"
                            name="engineCapacity"
                            value={formData.engineCapacity}
                            onChange={(e) => {
                              if (e.target.value === "custom") {
                                // If "custom" is selected, don't update the formData yet
                                // The user will input a custom value in the text field
                              } else {
                                handleInputChange(e)
                              }
                            }}
                            className="w-full px-3 py-2 rounded-lg border border-[#9FA791] dark:border-[#4A4D45] focus:outline-none focus:border-[#FF6700] dark:focus:border-[#FF7D33] appearance-none bg-white dark:bg-[#2A352A] text-[#3E5641] dark:text-white"
                            disabled={isSubmitting}
                          >
                            <option value="">Select Engine Capacity</option>
                            {engineCapacityOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                            <option value="custom">Custom Value</option>
                          </select>

                          {formData.engineCapacity === "custom" && (
                            <Input
                              id="customEngineCapacity"
                              name="engineCapacity"
                              value={formData.engineCapacity === "custom" ? "" : formData.engineCapacity}
                              onChange={handleInputChange}
                              placeholder="Enter custom engine capacity (e.g., 2.5L)"
                              className="border-[#9FA791] dark:border-[#4A4D45] focus:border-[#FF6700] dark:focus:border-[#FF7D33] focus:ring-[#FF6700] dark:focus:ring-[#FF7D33] dark:bg-[#1F2B20] dark:text-white"
                              disabled={isSubmitting}
                            />
                          )}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="bodyType" className="text-sm font-medium text-[#3E5641] dark:text-gray-300">
                          Body Type
                        </Label>
                        <select
                          id="bodyType"
                          name="bodyType"
                          value={formData.bodyType}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 rounded-lg border border-[#9FA791] dark:border-[#4A4D45] focus:outline-none focus:border-[#FF6700] dark:focus:border-[#FF7D33] appearance-none bg-white dark:bg-[#2A352A] text-[#3E5641] dark:text-white"
                          disabled={isSubmitting}
                        >
                          <option value="">Select Body Type</option>
                          {bodyTypeOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Description Section */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-[#3E5641] dark:text-white">Description</h3>
                    <div className="space-y-1.5">
                      <Label htmlFor="description" className="text-sm font-medium text-[#3E5641] dark:text-gray-300">
                        Vehicle Description (Optional)
                      </Label>
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Describe your vehicle, including any special features, condition details, or other information potential buyers should know..."
                        className="w-full px-3 py-2 rounded-lg border border-[#9FA791] dark:border-[#4A4D45] focus:outline-none focus:border-[#FF6700] dark:focus:border-[#FF7D33] focus:ring-[#FF6700] dark:focus:ring-[#FF7D33] dark:bg-[#1F2B20] dark:text-white min-h-[120px]"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end pt-4 mt-auto">
                    <Button
                      onClick={handleSubmitVehicle}
                      disabled={isSubmitting}
                      className="bg-[#FF6700] text-white hover:bg-[#FF6700]/90 dark:bg-[#FF7D33] dark:hover:bg-[#FF7D33]/90"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isSubmitting ? "Submitting..." : "List Vehicle"}
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

"use client"

import type React from "react"
import Image from "next/image"
import { useState, useRef, useEffect } from "react"
import { ArrowLeft, Camera, Save, AlertCircle, XCircle } from "lucide-react" // Import XCircle
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label" // Import Label
import { Alert, AlertDescription } from "@/components/ui/alert" // Import Alert components
import type { UserProfile } from "@/types/user"; // Import UserProfile from shared types

interface UploadVehicleProps {
  user: UserProfile; // User who is uploading
  onBack: () => void; // Callback to go back
  onVehicleSubmit: (vehicleData: any) => Promise<void>; // Callback to submit vehicle data
}

export default function UploadVehicle({ user, onBack, onVehicleSubmit }: UploadVehicleProps) {
  // --- State ---
  const [vehicleImages, setVehicleImages] = useState<string[]>([]); // For multiple vehicle images
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
    province: "",
    city: "",
    sellerName: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email.split("@")[0],
    sellerEmail: user.email,
    sellerPhone: user.phone || "",
    sellerAddress: user.suburb || user.city || user.province ? `${user.suburb ? user.suburb + ', ' : ''}${user.city ? user.city + ', ' : ''}${user.province || ''}` : "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Handlers ---
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setSubmitError(null); // Clear error on input change
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const files = event.target.files;
    if (files) {
      const newImages: string[] = [];
      const errors: string[] = [];

      // Check total number of images
      if (vehicleImages.length + files.length > 21) {
          setSubmitError(`You can upload a maximum of 21 images. You have ${vehicleImages.length} already.`);
          // Clear the input value so the same files can be selected again if needed
          if (fileInputRef.current) {
              fileInputRef.current.value = "";
          }
          return;
      }


      Array.from(files).forEach(file => {
        if (!file.type.startsWith("image/")) {
          errors.push(`File "${file.name}" is not a valid image.`);
          return;
        }
        // Optional: Add size check here (e.g., file.size > 5 * 1024 * 1024 for 5MB limit)

        const reader = new FileReader();
        reader.onload = () => {
          if (reader.result) {
            newImages.push(reader.result.toString());
            // If all files are processed, update state
            if (newImages.length + vehicleImages.length === vehicleImages.length + files.length - errors.length) {
                 setVehicleImages(prevImages => [...prevImages, ...newImages]);
                 setSubmitError(errors.length > 0 ? errors.join(" ") : null); // Show errors if any
                 // Clear the input value so the same files can be selected again if needed
                 if (fileInputRef.current) {
                     fileInputRef.current.value = "";
                 }
            }
          } else {
             errors.push(`Failed to read file "${file.name}".`);
             setSubmitError(errors.join(" "));
             // Clear the input value
             if (fileInputRef.current) {
                 fileInputRef.current.value = "";
             }
          }
        };
        reader.onerror = () => {
          errors.push(`Failed to read file "${file.name}".`);
          setSubmitError(errors.join(" "));
           // Clear the input value
           if (fileInputRef.current) {
               fileInputRef.current.value = "";
           }
        };
        reader.readAsDataURL(file);
      });
       setSubmitError(errors.length > 0 ? errors.join(" ") : null); // Show errors immediately for invalid files
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = (index: number) => {
      setVehicleImages(prevImages => prevImages.filter((_, i) => i !== index));
      setSubmitError(null); // Clear error if removing images might fix min count
  };

  // Note: Reordering functionality would be added here (e.g., using react-beautiful-dnd)
  // For now, images are displayed in upload order.

  const handleSubmitVehicle = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    // Basic validation
    if (!formData.make || !formData.model || !formData.year || !formData.price || !formData.mileage || !formData.transmission || !formData.fuel || !formData.engineCapacity || !formData.province || !formData.city) {
        setSubmitError("Please fill in all required fields.");
        setIsSubmitting(false);
        return;
    }

    // Image count validation
    if (vehicleImages.length < 5) {
        setSubmitError(`Please upload at least 5 images. You have ${vehicleImages.length}.`);
        setIsSubmitting(false);
        return;
    }
     if (vehicleImages.length > 21) {
        setSubmitError(`You can upload a maximum of 21 images. You have ${vehicleImages.length}.`);
        setIsSubmitting(false);
        return;
    }


    try {
      // Prepare data for submission
      const vehicleData = {
        ...formData,
        images: vehicleImages, // Include the array of base64 image data
        // Add any other necessary fields like sellerId from user object
        sellerId: user.id, // Assuming user object has an id
      };

      await onVehicleSubmit(vehicleData); // Call the submit prop

      setSubmitSuccess("Vehicle listed successfully!");
      // Optionally clear form or navigate back after success
      // setFormData({ ...initial empty state... });
      // setVehicleImages(undefined);
      // onBack(); // Navigate back after successful submission

    } catch (error) {
      console.error("Failed to submit vehicle:", error);
      setSubmitError(error instanceof Error ? error.message : "Failed to list vehicle.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Vehicle Image Upload and Preview Card */}
            <div className="lg:w-1/3 flex">
              <Card className="rounded-3xl overflow-hidden p-6 flex flex-col w-full border-[#9FA791]/20 dark:border-[#4A4D45]/20 bg-white dark:bg-[#2A352A]">
                {/* Upload Area */}
                <div className="relative w-full aspect-video mb-4 bg-gray-200 dark:bg-gray-700 rounded-2xl flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-90 transition-opacity" onClick={triggerFileInput}>
                   {vehicleImages.length > 0 ? (
                       <Image
                           src={vehicleImages[0]} // Display the first image as the main preview
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
                    onClick={(e) => { e.stopPropagation(); triggerFileInput(); }} // Prevent card click from triggering twice
                    aria-label="Upload vehicle images"
                  >
                    <Camera className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/png, image/jpeg, image/webp"
                      multiple // Allow multiple file selection
                      onChange={handleImageUpload}
                    />
                  </Button>
                </div>

                {/* Image Previews (Below Upload Area) */}
                {vehicleImages.length > 0 && (
                    <div className="mt-4">
                        <h3 className="text-lg font-semibold mb-3 text-[#3E5641] dark:text-white">Uploaded Images ({vehicleImages.length})</h3>
                        {/* Note: Implement drag-and-drop for reordering here */}
                        <div className="grid grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                            {vehicleImages.map((image, index) => (
                                <div key={index} className="relative aspect-square overflow-hidden rounded-lg group">
                                    <Image
                                        src={image}
                                        alt={`Vehicle image ${index + 1}`}
                                        layout="fill"
                                        objectFit="cover"
                                        unoptimized
                                        className="object-cover"
                                    />
                                    <button
                                        onClick={() => handleRemoveImage(index)}
                                        className="absolute top-1 right-1 bg-red-500/80 hover:bg-red-600/90 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                        aria-label={`Remove image ${index + 1}`}
                                    >
                                        <XCircle className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                         <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">Click images to remove. (Reorder coming soon)</p>
                    </div>
                )}


                <div className="text-center flex-grow flex flex-col justify-center mt-6"> {/* Adjusted margin top */}
                  <h2 className="text-2xl font-bold text-[#3E5641] dark:text-white">Vehicle Details</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Provide accurate details about your car.</p>
                </div>
              </Card>
            </div>

            {/* Vehicle Details Form */}
            <div className="lg:w-2/3 flex">
              <Card className="rounded-3xl p-6 w-full border-[#9FA791]/20 dark:border-[#4A4D45]/20 bg-white dark:bg-[#2A352A]">
                 {submitError && (
                      <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{submitError}</AlertDescription>
                      </Alert>
                    )}
                     {submitSuccess && (
                      <Alert className="bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700 text-green-800 dark:text-green-200 mb-4">
                        <AlertCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <AlertDescription>{submitSuccess}</AlertDescription>
                      </Alert>
                    )}
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="make" className="text-sm font-medium text-[#3E5641] dark:text-gray-300">Make</Label>
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
                        <Label htmlFor="model" className="text-sm font-medium text-[#3E5641] dark:text-gray-300">Model</Label>
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
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="year" className="text-sm font-medium text-[#3E5641] dark:text-gray-300">Year</Label>
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
                        <div className="space-y-1.5">
                            <Label htmlFor="price" className="text-sm font-medium text-[#3E5641] dark:text-gray-300">Price (ZAR)</Label>
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
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="mileage" className="text-sm font-medium text-[#3E5641] dark:text-gray-300">Mileage (km)</Label>
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
                            <Label htmlFor="transmission" className="text-sm font-medium text-[#3E5641] dark:text-gray-300">Transmission</Label>
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
                    </div>

                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="fuel" className="text-sm font-medium text-[#3E5641] dark:text-gray-300">Fuel Type</Label>
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
                            <Label htmlFor="engineCapacity" className="text-sm font-medium text-[#3E5641] dark:text-gray-300">Engine Capacity</Label>
                             <select
                                id="engineCapacity"
                                name="engineCapacity"
                                value={formData.engineCapacity}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 rounded-lg border border-[#9FA791] dark:border-[#4A4D45] focus:outline-none focus:border-[#FF6700] dark:focus:border-[#FF7D33] appearance-none bg-white dark:bg-[#2A352A] text-[#3E5641] dark:text-white"
                                disabled={isSubmitting}
                            >
                                <option value="">Select Engine Capacity</option>
                                <option value="1.0-1.5">1.0L - 1.5L</option>
                                <option value="1.6-2.0">1.6L - 2.0L</option>
                                <option value="2.1-3.0">2.1L - 3.0L</option>
                                <option value="3.1+">3.1L+</option>
                            </select>
                        </div>
                    </div>

                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="bodyType" className="text-sm font-medium text-[#3E5641] dark:text-gray-300">Body Type (Optional)</Label>
                             <select
                                id="bodyType"
                                name="bodyType"
                                value={formData.bodyType}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 rounded-lg border border-[#9FA791] dark:border-[#4A4D45] focus:outline-none focus:border-[#FF6700] dark:focus:border-[#FF7D33] appearance-none bg-white dark:bg-[#2A352A] text-[#3E5641] dark:text-white"
                                disabled={isSubmitting}
                            >
                                <option value="">Select Body Type</option>
                                <option value="Sedan">Sedan</option>
                                <option value="SUV">SUV</option>
                                <option value="Truck">Truck</option>
                                <option value="Motorcycle">Motorcycle</option>
                                <option value="Hatchback">Hatchback</option>
                                <option value="Convertible">Convertible</option>
                                {/* Add more as needed */}
                            </select>
                        </div>
                         <div className="space-y-1.5">
                            <Label htmlFor="variant" className="text-sm font-medium text-[#3E5641] dark:text-gray-300">Variant (Optional)</Label>
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="province" className="text-sm font-medium text-[#3E5641] dark:text-gray-300">Province</Label>
                            <select
                                id="province"
                                name="province"
                                value={formData.province}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 rounded-lg border border-[#9FA791] dark:border-[#4A4D45] focus:outline-none focus:border-[#FF6700] dark:focus:border-[#FF7D33] appearance-none bg-white dark:bg-[#2A352A] text-[#3E5641] dark:text-white"
                                disabled={isSubmitting}
                            >
                                <option value="">Select Province</option>
                                <option value="Western Cape">Western Cape</option>
                                <option value="Gauteng">Gauteng</option>
                                <option value="KwaZulu-Natal">KwaZulu-Natal</option>
                                <option value="Eastern Cape">Eastern Cape</option>
                                <option value="Free State">Free State</option>
                                <option value="Mpumalanga">Mpumalanga</option>
                                <option value="North West">North West</option>
                                <option value="Northern Cape">Northern Cape</option>
                                <option value="Limpopo">Limpopo</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="city" className="text-sm font-medium text-[#3E5641] dark:text-gray-300">City</Label>
                            <Input
                                id="city"
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                placeholder="e.g., Cape Town"
                                className="border-[#9FA791] dark:border-[#4A4D45] focus:border-[#FF6700] dark:focus:border-[#FF7D33] focus:ring-[#FF6700] dark:focus:ring-[#FF7D33] dark:bg-[#1F2B20] dark:text-white"
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="description" className="text-sm font-medium text-[#3E5641] dark:text-gray-300">Description (Optional)</Label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Describe your vehicle..."
                            className="w-full px-3 py-2 rounded-lg border border-[#9FA791] dark:border-[#4A4D45] focus:outline-none focus:border-[#FF6700] dark:focus:border-[#FF7D33] focus:ring-[#FF6700] dark:focus:ring-[#FF7D33] dark:bg-[#1F2B20] dark:text-white min-h-[100px]"
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* Seller Info (pre-filled from user profile) */}
                    <div className="mt-6 border-t border-[#9FA791]/20 dark:border-[#4A4D45]/20 pt-6">
                        <h3 className="text-lg font-semibold mb-4 text-[#3E5641] dark:text-white">Seller Information</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="sellerName" className="text-sm font-medium text-[#3E5641] dark:text-gray-300">Seller Name</Label>
                                <Input
                                    id="sellerName"
                                    name="sellerName"
                                    value={formData.sellerName}
                                    onChange={handleInputChange}
                                    className="border-[#9FA791] dark:border-[#4A4D45] focus:border-[#FF6700] dark:focus:border-[#FF7D33] focus:ring-[#FF6700] dark:focus:ring-[#FF7D33] dark:bg-[#1F2B20] dark:text-white disabled:opacity-70"
                                    disabled // Seller name is pre-filled and not editable here
                                />
                            </div>
                             <div className="space-y-1.5">
                                <Label htmlFor="sellerEmail" className="text-sm font-medium text-[#3E5641] dark:text-gray-300">Seller Email</Label>
                                <Input
                                    id="sellerEmail"
                                    name="sellerEmail"
                                    type="email"
                                    value={formData.sellerEmail}
                                    onChange={handleInputChange}
                                    className="border-[#9FA791] dark:border-[#4A4D45] focus:border-[#FF6700] dark:focus:border-[#FF7D33] focus:ring-[#FF6700] dark:focus:ring-[#FF7D33] dark:bg-[#1F2B20] dark:text-white disabled:opacity-70"
                                    disabled // Seller email is pre-filled and not editable here
                                />
                            </div>
                        </div>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="sellerPhone" className="text-sm font-medium text-[#3E5641] dark:text-gray-300">Seller Phone (Optional)</Label>
                                <Input
                                    id="sellerPhone"
                                    name="sellerPhone"
                                    type="tel"
                                    value={formData.sellerPhone}
                                    onChange={handleInputChange}
                                    placeholder="+27 12 345 6789"
                                    className="border-[#9FA791] dark:border-[#4A4D45] focus:border-[#FF6700] dark:focus:border-[#FF7D33] focus:ring-[#FF6700] dark:focus:ring-[#FF7D33] dark:bg-[#1F2B20] dark:text-white disabled:opacity-70"
                                    disabled // Seller phone is pre-filled and not editable here
                                />
                            </div>
                             <div className="space-y-1.5">
                                <Label htmlFor="sellerAddress" className="text-sm font-medium text-[#3E5641] dark:text-gray-300">Seller Address (Optional)</Label>
                                <Input
                                    id="sellerAddress"
                                    name="sellerAddress"
                                    value={formData.sellerAddress}
                                    onChange={handleInputChange}
                                    placeholder="e.g., 123 Main St"
                                    className="border-[#9FA791] dark:border-[#4A4D45] focus:border-[#FF6700] dark:focus:border-[#FF7D33] focus:ring-[#FF6700] dark:focus:ring-[#FF7D33] dark:bg-[#1F2B20] dark:text-white disabled:opacity-70"
                                    disabled // Seller address is pre-filled and not editable here
                                />
                            </div>
                        </div>
                    </div>


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
  );
}

// Import any necessary icons not already imported
// import { Star } from "lucide-react"; // Star was in vehicle-details, might not be needed here but keeping for reference

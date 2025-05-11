
"use client"
import { useState, useEffect, useMemo, useRef } from "react"
import type React from "react"

import {
  Wifi,
  Car,
  Thermometer,
  Clock,
  ShoppingBag,
  Shield,
  Heart,
  Phone,
  Mail,
  X,
  ChevronLeft,
  ChevronRight,
  Star, // Keep for review tab
  Search, // For image zoom overlay
} from "lucide-react"
import type { Vehicle } from "@/lib/data"

interface VehicleDetailsProps {
  vehicle: Vehicle // Assumes Vehicle type now has vehicle.images?: string[]
  onBack: () => void
  user?: any // Add user prop to check if logged in
  onSaveCar?: (vehicle: Vehicle) => void // Add callback for saving cars
  savedCars?: Vehicle[] // Add array of saved cars to check if this car is saved
}

export default function VehicleDetails({ vehicle, onBack, user, onSaveCar, savedCars = [] }: VehicleDetailsProps) {
  const [showContactForm, setShowContactForm] = useState(false)
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [isMobile, setIsMobile] = useState(false)
  const [activeTab, setActiveTab] = useState("details")
  const [isSaved, setIsSaved] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)

  // Check if this vehicle is in the saved cars list
  useEffect(() => {
    if (savedCars.some((car) => car.id === vehicle.id)) {
      setIsSaved(true)
    }
  }, [savedCars, vehicle.id])

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  const handleContactClick = () => {
    if (isMobile) {
      window.location.href = `tel:${vehicle.sellerPhone.replace(/\s+/g, "")}`
    } else {
      setShowContactForm(true)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert(`Message sent to ${vehicle.sellerEmail}!\n\nFrom: ${email}\nMessage: ${message}`)
    setShowContactForm(false)
    setEmail("")
    setMessage("")
  }

  const handleSaveClick = () => {
    if (!user) {
      alert("Please log in to save vehicles")
      return
    }

    setIsSaved(!isSaved)
    if (onSaveCar) {
      onSaveCar(vehicle)
    }
  }

  const allDisplayableImages = useMemo(() => {
    if (vehicle.images && vehicle.images.length > 0) {
      return vehicle.images
    }
    if (vehicle.image) {
      return [vehicle.image]
    }
    return []
  }, [vehicle.images, vehicle.image])

  // Get images for Gallery 1 (5 images)
  const getGalleryOneImages = () => {
    return allDisplayableImages.slice(0, 5)
  }

  // Get images for Gallery 2 (8 images)
  const getGalleryTwoImages = () => {
    return allDisplayableImages.slice(5, 13)
  }

  // Get images for Gallery 3 (8 images)
  const getGalleryThreeImages = () => {
    return allDisplayableImages.slice(13, 21)
  }

  const openImageModal = (index: number) => {
    setSelectedImageIndex(index)
    setIsImageModalOpen(true)
    // Prevent body scrolling when modal is open
    document.body.style.overflow = "hidden"
  }

  const closeImageModal = () => {
    setIsImageModalOpen(false)
    setSelectedImageIndex(null)
    // Restore body scrolling
    document.body.style.overflow = "auto"
  }

  const navigateImage = (direction: "prev" | "next") => {
    if (selectedImageIndex === null) return

    const totalImages = allDisplayableImages.length
    if (direction === "prev") {
      setSelectedImageIndex((prev) => (prev !== null ? (prev > 0 ? prev - 1 : totalImages - 1) : null))
    } else {
      setSelectedImageIndex((prev) => (prev !== null ? (prev < totalImages - 1 ? prev + 1 : 0) : null))
    }
  }

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isImageModalOpen || selectedImageIndex === null) return

      if (e.key === "Escape") {
        closeImageModal()
      } else if (e.key === "ArrowLeft") {
        navigateImage("prev")
      } else if (e.key === "ArrowRight") {
        navigateImage("next")
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isImageModalOpen, selectedImageIndex, allDisplayableImages.length]) // Added allDisplayableImages.length

  const galleryOneDisplayImages = getGalleryOneImages()
  const galleryTwoDisplayImages = getGalleryTwoImages()
  const galleryThreeDisplayImages = getGalleryThreeImages()


  return (
    <div className="min-h-screen">
      {/* Header Section with Back Button and Price */}
      <section className="px-6 pt-6 md:pt-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button
            onClick={onBack}
            className="inline-flex items-center text-[#FF6700] dark:text-[#FF7D33] hover:underline"
          >
            &larr; Back to Listings
          </button>
          <p className="text-[#FF6700] dark:text-[#FF7D33] text-2xl md:text-3xl font-bold">{vehicle.price}</p>
        </div>
      </section>

      {/* Image Gallery */}
      {allDisplayableImages.length === 0 ? (
        <div className="px-6 max-w-7xl mx-auto mt-4 h-[400px] flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-500">No images available for this vehicle.</p>
        </div>
      ) : (
        <div className="px-6 max-w-7xl mx-auto mt-4 relative">
          <div className="gallery-container relative flex items-center">
            <div
              className="gallery-scroll flex overflow-x-auto snap-x snap-mandatory w-full"
            >
              {/* Gallery 1 */}
              {galleryOneDisplayImages.length > 0 && (
                <section className="gallery-section flex-shrink-0 w-full snap-center grid grid-cols-1 md:grid-cols-3 gap-4 h-[400px]">
                  <div className="md:col-span-2 h-full overflow-hidden rounded-lg group relative">
                    <img
                      src={galleryOneDisplayImages[0]}
                      alt={`${vehicle.make} ${vehicle.model} main view`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                      onClick={() => openImageModal(0)}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="bg-white/80 rounded-full p-2">
                        <Search className="w-6 h-6 text-[#3E5641]" />
                      </div>
                    </div>
                  </div>
                  {galleryOneDisplayImages.length > 1 && (
                    <div className="grid grid-cols-2 gap-4 h-full">
                      {galleryOneDisplayImages.slice(1).map((imgSrc, index) => (
                        <div key={`g1-thumb-${index}`} className="aspect-square overflow-hidden rounded-lg group relative h-full">
                          <img
                            src={imgSrc}
                            alt={`${vehicle.make} ${vehicle.model} view ${index + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                            onClick={() => openImageModal(index + 1)}
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <div className="bg-white/80 rounded-full p-2">
                              <Search className="w-4 h-4 text-[#3E5641]" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              )}

              {/* Gallery 2 */}
              {galleryTwoDisplayImages.length > 0 && (
                <section className="gallery-section flex-shrink-0 w-full snap-center grid grid-cols-2 sm:grid-cols-4 gap-4 h-[400px]">
                  {galleryTwoDisplayImages.map((imgSrc, index) => (
                    <div key={`g2-img-${index}`} className="w-full h-full overflow-hidden rounded-lg group relative">
                      <img
                        src={imgSrc}
                        alt={`${vehicle.make} ${vehicle.model} additional view ${index + 5}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                        onClick={() => openImageModal(index + 5)}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="bg-white/80 rounded-full p-2">
                          <Search className="w-4 h-4 text-[#3E5641]" />
                        </div>
                      </div>
                    </div>
                  ))}
                </section>
              )}

              {/* Gallery 3 */}
              {galleryThreeDisplayImages.length > 0 && (
                <section className="gallery-section flex-shrink-0 w-full snap-center grid grid-cols-2 sm:grid-cols-4 gap-4 h-[400px]">
                  {galleryThreeDisplayImages.map((imgSrc, index) => (
                    <div key={`g3-img-${index}`} className="w-full h-full overflow-hidden rounded-lg group relative">
                      <img
                        src={imgSrc}
                        alt={`${vehicle.make} ${vehicle.model} additional view ${index + 13}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                        onClick={() => openImageModal(index + 13)}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="bg-white/80 rounded-full p-2">
                          <Search className="w-4 h-4 text-[#3E5641]" />
                        </div>
                      </div>
                    </div>
                  ))}
                </section>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {isImageModalOpen && selectedImageIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
          <button
            onClick={closeImageModal}
            className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/70 p-2 rounded-full transition-colors"
            aria-label="Close image"
          >
            <X className="w-6 h-6" />
          </button>

          <button
            onClick={() => navigateImage("prev")}
            className="absolute left-4 text-white bg-black/50 hover:bg-black/70 p-2 rounded-full transition-colors"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <img
            src={allDisplayableImages[selectedImageIndex]}
            alt={`${vehicle.make} ${vehicle.model} enlarged view`}
            className="max-h-[90vh] max-w-[90vw] object-contain"
          />

          <button
            onClick={() => navigateImage("next")}
            className="absolute right-4 text-white bg-black/50 hover:bg-[#3E5641]/70 transition-colors"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Removed image index text */}
        </div>
      )}

      {/* Vehicle Title and Details */}
      <div className="px-6 max-w-7xl mx-auto mt-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-2xl md:text-3xl font-bold text-[#3E5641] dark:text-white">
            {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.variant}
          </h2>
          <div className="flex gap-4">
            <div className="bg-[#9FA791]/20 dark:bg-[#4A4D45]/40 px-3 py-1.5 rounded-full text-sm text-[#3E5641] dark:text-white">
              Sponsored
            </div>
            <button
              onClick={handleSaveClick}
              className="text-[#3E5641] dark:text-white px-3 py-1.5 rounded-full text-sm flex items-center space-x-1 hover:bg-[#FFF8E0] dark:hover:bg-[#2A352A] cursor-pointer"
            >
              <Heart
                className={`w-4 h-4 ${isSaved ? "text-purple-600 fill-purple-600" : "text-[#FF6700] dark:text-[#FF7D33]"}`}
              />
              <span>{isSaved ? "Saved" : "Save"}</span>
            </button>
          </div>
        </div>

        <p className="text-[#6F7F69] dark:text-gray-300 mb-2">
          Mileage: {vehicle.mileage} km | Transmission: {vehicle.transmission} | Fuel: {vehicle.fuel} | Engine:{" "}
          {vehicle.engineCapacity}
        </p>
      </div>

      {/* Tabs Section */}
      <div className="border-b border-[#9FA791]/20 dark:border-[#4A4D45]/20 mt-4">
        <div className="px-6 max-w-7xl mx-auto flex space-x-8">
          <button
            className={`py-3 font-medium ${activeTab === "details" ? "border-b-2 border-[#FF6700] dark:border-[#FF7D33] text-[#3E5641] dark:text-white" : "text-[#6F7F69] dark:text-gray-400 hover:text-[#3E5641] dark:hover:text-white"}`}
            onClick={() => setActiveTab("details")}
          >
            Details
          </button>
          <button
            className={`py-3 font-medium ${activeTab === "report" ? "border-b-2 border-[#FF6700] dark:border-[#FF7D33] text-[#3E5641] dark:text-white" : "text-[#6F7F69] dark:text-gray-400 hover:text-[#3E5641] dark:hover:text-white"}`}
            onClick={() => setActiveTab("report")}
          >
            Vehicle Report
          </button>
          <button
            className={`py-3 font-medium ${activeTab === "insurance" ? "border-b-2 border-[#FF6700] dark:border-[#FF7D33] text-[#3E5641] dark:text-white" : "text-[#6F7F69] dark:text-gray-400 hover:text-[#3E5641] dark:hover:text-white"}`}
            onClick={() => setActiveTab("insurance")}
          >
            Insurance Quote
          </button>
          <button
            className={`py-3 font-medium ${activeTab === "review" ? "border-b-2 border-[#FF6700] dark:border-[#FF7D33] text-[#3E5641] dark:text-white" : "text-[#6F7F69] dark:text-gray-400 hover:text-[#3E5641] dark:hover:text-white"}`}
            onClick={() => setActiveTab("review")}
          >
            Vehicle Review
          </button>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="px-6 py-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {activeTab === "details" && (
              <>
                <h2 className="text-2xl font-bold mb-4 text-[#3E5641] dark:text-white">Description</h2>
                {vehicle.description ? (
                  <p className="text-[#6F7F69] dark:text-gray-300 mb-6 whitespace-pre-wrap">{vehicle.description}</p>
                ) : (
                  <p className="text-[#6F7F69] dark:text-gray-300 mb-6">
                    No specific description provided by the seller. General details: {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.variant}, {vehicle.mileage} km, {vehicle.transmission}, {vehicle.fuel} engine. Located in {vehicle.city || 'N/A'}, {vehicle.province || 'N/A'}.
                  </p>
                )}

                <div className="mt-6">
                  <h3 className="text-xl font-bold mb-4 text-[#3E5641] dark:text-white">Technical Details</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-[#6F7F69] dark:text-gray-400 text-sm">Make</p>
                      <p className="text-[#3E5641] dark:text-white">{vehicle.make}</p>
                    </div>
                    <div>
                      <p className="text-[#6F7F69] dark:text-gray-400 text-sm">Model</p>
                      <p className="text-[#3E5641] dark:text-white">
                        {vehicle.model} {vehicle.variant}
                      </p>
                    </div>
                    <div>
                      <p className="text-[#6F7F69] dark:text-gray-400 text-sm">Year</p>
                      <p className="text-[#3E5641] dark:text-white">{vehicle.year}</p>
                    </div>
                    <div>
                      <p className="text-[#6F7F69] dark:text-gray-400 text-sm">Mileage</p>
                      <p className="text-[#3E5641] dark:text-white">{vehicle.mileage} km</p>
                    </div>
                    <div>
                      <p className="text-[#6F7F69] dark:text-gray-400 text-sm">Transmission</p>
                      <p className="text-[#3E5641] dark:text-white">{vehicle.transmission}</p>
                    </div>
                    <div>
                      <p className="text-[#6F7F69] dark:text-gray-400 text-sm">Fuel</p>
                      <p className="text-[#3E5641] dark:text-white">{vehicle.fuel}</p>
                    </div>
                    <div>
                      <p className="text-[#6F7F69] dark:text-gray-400 text-sm">Engine</p>
                      <p className="text-[#3E5641] dark:text-white">{vehicle.engineCapacity}</p>
                    </div>
                    <div>
                      <p className="text-[#6F7F69] dark:text-gray-400 text-sm">Body Type</p>
                      <p className="text-[#3E5641] dark:text-white">{vehicle.bodyType}</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === "report" && (
              <div className="relative">
                <h2 className="text-2xl font-bold mb-4 text-[#3E5641] dark:text-white">Vehicle Report</h2>
                {/* Removed blur and Coming Soon overlay */}
                <div className="h-[400px] w-full bg-[#f5f5f5] dark:bg-[#2A352A] rounded-lg flex items-center justify-center"> {/* Removed blur-[2px] */}
                  <div className="text-center">
                    <Car className="w-16 h-16 mx-auto mb-4 text-[#9FA791] dark:text-[#4A4D45]" />
                    <p className="text-lg font-medium text-[#6F7F69] dark:text-gray-400">
                      Comprehensive vehicle history report
                    </p>
                    <p className="text-sm text-[#9FA791] dark:text-[#4A4D45] mt-2">
                      Including accident history, service records, and ownership details
                    </p>
                  </div>
                </div>
                {/* Removed Coming Soon overlay div */}
              </div>
            )}

            {activeTab === "insurance" && (
              <div className="relative">
                <h2 className="text-2xl font-bold mb-4 text-[#3E5641] dark:text-white">Insurance Quote</h2>
                {/* Removed blur and Coming Soon overlay */}
                <div className="h-[400px] w-full bg-[#f5f5f5] dark:bg-[#2A352A] rounded-lg flex items-center justify-center"> {/* Removed blur-[2px] */}
                  <div className="text-center">
                    <Shield className="w-16 h-16 mx-auto mb-4 text-[#9FA791] dark:text-[#4A4D45]" />
                    <p className="text-lg font-medium text-[#6F7F69] dark:text-gray-400">
                      Get instant insurance quotes
                    </p>
                    <p className="text-sm text-[#9FA791] dark:text-[#4A4D45] mt-2">
                      Compare rates from multiple providers
                    </p>
                  </div>
                </div>
                {/* Removed Coming Soon overlay div */}
              </div>
            )}

            {activeTab === "review" && (
              <div className="relative">
                <h2 className="text-2xl font-bold mb-4 text-[#3E5641] dark:text-white">Vehicle Review</h2>
                {/* Removed blur and Coming Soon overlay */}
                <div className="h-[400px] w-full bg-[#f5f5f5] dark:bg-[#2A352A] rounded-lg flex items-center justify-center"> {/* Removed blur-[2px] */}
                  <div className="text-center">
                    <Star className="w-16 h-16 mx-auto mb-4 text-[#9FA791] dark:text-[#4A4D45]" />
                    <p className="text-lg font-medium text-[#6F7F69] dark:text-gray-400">Expert vehicle reviews</p>
                    <p className="text-sm text-[#9FA791] dark:text-[#4A4D45] mt-2">Detailed analysis and ratings</p>
                  </div>
                </div>
                {/* Removed Coming Soon overlay div */}
              </div>
            )}
          </div>

          {/* Contact Seller Section */}
          <div className="lg:col-span-1">
            <div className="bg-[#3E5641]/80 dark:bg-[#1F2B20]/80 backdrop-blur-lg rounded-xl shadow-lg p-8 border border-white/10">
              <h3 className="text-xl font-bold mb-6 text-white">Contact Seller</h3>

              {showContactForm ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm text-gray-300 mb-1">
                      Your Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-[#576B55] dark:bg-[#2A352A] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6700] dark:focus:ring-[#FF7D33]"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm text-gray-300 mb-1">
                      Message
                    </label>
                    <textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full px-3 py-2 bg-[#576B55] dark:bg-[#2A352A] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6700] dark:focus:ring-[#FF7D33] min-h-[100px]"
                      placeholder="I'm interested in this vehicle..."
                      required
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      className="flex-1 bg-[#FF6700] dark:bg-[#FF7D33] text-white font-medium py-3 rounded-xl hover:bg-[#FF6700]/90 dark:hover:bg-[#FF7D33]/90 transition-colors"
                    >
                      Send Message
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowContactForm(false)}
                      className="flex-1 bg-[#576B55] dark:bg-[#2A352A] text-white font-medium py-3 rounded-xl hover:bg-[#576B55]/90 dark:hover:bg-[#2A352A]/90 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-5 text-white">
                  <div>
                    <p className="text-gray-300 text-sm">Seller</p>
                    <p>{vehicle.sellerName}</p>
                  </div>
                  <div>
                    <p className="text-gray-300 text-sm">Phone</p>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-[#FF6700] dark:text-[#FF7D33]" />
                      <p>{vehicle.sellerPhone}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-300 text-sm">Email</p>
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-[#FF6700] dark:text-[#FF7D33]" />
                      <p>{vehicle.sellerEmail}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-300 text-sm">Address</p>
                    <p>{vehicle.sellerAddress}</p>
                  </div>
                  <button
                    onClick={handleContactClick}
                    className="w-full bg-[#FF6700] dark:bg-[#FF7D33] text-white font-medium py-3 rounded-xl hover:bg-[#FF6700]/90 dark:hover:bg-[#FF7D33]/90 transition-colors mt-4 flex justify-center items-center"
                  >
                    {isMobile ? (
                      <>
                        <Phone className="w-5 h-5 mr-2" />
                        Call Seller
                      </>
                    ) : (
                      <>
                        <Mail className="w-5 h-5 mr-2" />
                        Contact Seller
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Location Map */}
            <div className="mt-6 rounded-xl overflow-hidden h-[150px] w-full shadow-lg">
              <iframe
                title="Seller Location"
                className="w-full h-full"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps?q=${encodeURIComponent(
                  vehicle.sellerAddress || `${vehicle.city}, ${vehicle.province}`,
                )}&output=embed&hl=en`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

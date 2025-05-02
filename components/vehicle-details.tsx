"use client"
import { useState, useEffect } from "react"
import type React from "react"

import { Wifi, Car, Thermometer, Clock, ShoppingBag, Shield, Heart, Phone, Mail } from "lucide-react"
import type { Vehicle } from "@/lib/data"

interface VehicleDetailsProps {
  vehicle: Vehicle
  onBack: () => void
}

export default function VehicleDetails({ vehicle, onBack }: VehicleDetailsProps) {
  const [showContactForm, setShowContactForm] = useState(false)
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [isMobile, setIsMobile] = useState(false)

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
          <p className="text-[#FF6700] dark:text-[#FF7D33] text-2xl md:text-3xl font-bold">
            {vehicle.price}
          </p>
        </div>
      </section>

      {/* Image Gallery */}
      <div className="px-6 max-w-7xl mx-auto mt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 h-[400px] overflow-hidden rounded-lg">
            <img
              src={vehicle.image || "https://via.placeholder.com/600/111/fff?text=Luxury+Vehicle"}
              alt={`${vehicle.make} ${vehicle.model}`}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="grid grid-cols-2 gap-4 h-[400px]">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="overflow-hidden rounded-lg">
                <img
                  src="https://via.placeholder.com/600/111/fff?text=Luxury+Vehicle"
                  alt="Vehicle detail"
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

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
            <div className="text-[#3E5641] dark:text-white px-3 py-1.5 rounded-full text-sm flex items-center space-x-1 hover:bg-[#FFF8E0] dark:hover:bg-[#2A352A] cursor-pointer">
              <Heart className="w-4 h-4 text-[#FF6700] dark:text-[#FF7D33]" />
              <span>Save</span>
            </div>
          </div>
        </div>

        <p className="text-[#6F7F69] dark:text-gray-300 mb-2">
          Mileage: {vehicle.mileage} km | Transmission: {vehicle.transmission} | Fuel: {vehicle.fuel}
        </p>
      </div>

      {/* Tabs Section */}
      <div className="border-b border-[#9FA791]/20 dark:border-[#4A4D45]/20 mt-4">
        <div className="px-6 max-w-7xl mx-auto flex space-x-8">
          <button className="py-3 border-b-2 border-[#FF6700] dark:border-[#FF7D33] font-medium text-[#3E5641] dark:text-white">
            Details
          </button>
          <button className="py-3 text-[#6F7F69] dark:text-gray-400 hover:text-[#3E5641] dark:hover:text-white">
            Models
          </button>
          <button className="py-3 text-[#6F7F69] dark:text-gray-400 hover:text-[#3E5641] dark:hover:text-white">
            Features
          </button>
          <button className="py-3 text-[#6F7F69] dark:text-gray-400 hover:text-[#3E5641] dark:hover:text-white">
            Terms
          </button>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="px-6 py-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-4 text-[#3E5641] dark:text-white">Vehicle Overview</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              <div className="flex items-center">
                <Wifi className="w-6 h-6 mr-4 text-[#FF6700] dark:text-[#FF7D33]" />
                <span className="text-[#3E5641] dark:text-white">Connectivity options</span>
              </div>
              <div className="flex items-center">
                <Car className="w-6 h-6 mr-4 text-[#FF6700] dark:text-[#FF7D33]" />
                <span className="text-[#3E5641] dark:text-white">Valet parking service</span>
              </div>
              <div className="flex items-center">
                <Thermometer className="w-6 h-6 mr-4 text-[#FF6700] dark:text-[#FF7D33]" />
                <span className="text-[#3E5641] dark:text-white">Climate control system</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-6 h-6 mr-4 text-[#FF6700] dark:text-[#FF7D33]" />
                <span className="text-[#3E5641] dark:text-white">24/7 customer support</span>
              </div>
              <div className="flex items-center">
                <ShoppingBag className="w-6 h-6 mr-4 text-[#FF6700] dark:text-[#FF7D33]" />
                <span className="text-[#3E5641] dark:text-white">Luxury interiors</span>
              </div>
              <div className="flex items-center">
                <Shield className="w-6 h-6 mr-4 text-[#FF6700] dark:text-[#FF7D33]" />
                <span className="text-[#3E5641] dark:text-white">Advanced security features</span>
              </div>
            </div>

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
                  <p className="text-[#6F7F69] dark:text-gray-400 text-sm">Location</p>
                  <p className="text-[#3E5641] dark:text-white">
                    {vehicle.city}, {vehicle.province}
                  </p>
                </div>
              </div>
            </div>
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
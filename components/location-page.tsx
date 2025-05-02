"use client"

import { useState } from "react"
import type { Vehicle } from "@/lib/data"

interface LocationPageProps {
  province: string
  vehicles: Vehicle[]
  onBack: () => void
}

export default function LocationPage({ province, vehicles, onBack }: LocationPageProps) {
  const [selectedCity, setSelectedCity] = useState("")

  // Filter vehicles based on province and selected city.
  const filteredVehicles = vehicles.filter(
    (v) => v.province === province && (selectedCity ? v.city === selectedCity : true),
  )

  // Unique list of cities.
  const cities = [...new Set(vehicles.filter((v) => v.province === province).map((v) => v.city))]

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <button onClick={onBack} className="text-xl font-bold text-red-500 cursor-pointer">
          CarMarketplace
        </button>
        <button onClick={onBack} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors">
          Back
        </button>
      </div>
      <h2 className="text-3xl font-bold mb-4">{province}</h2>
      <div className="mb-6">
        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className="px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:border-red-500"
        >
          <option value="">All Cities</option>
          {cities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredVehicles.map((vehicle) => (
          <div
            key={vehicle.id}
            className="bg-white border border-gray-200 rounded-lg shadow hover:shadow-md transition-shadow p-4"
          >
            <img
              src={vehicle.image || "/placeholder.svg"}
              alt={`${vehicle.make} ${vehicle.model}`}
              className="w-full h-40 object-cover rounded-t-lg"
            />
            <h3 className="text-lg font-semibold mt-2">
              {vehicle.make} {vehicle.model}
            </h3>
            <p className="text-sm">{vehicle.price}</p>
          </div>
        ))}
        {filteredVehicles.length === 0 && <p className="text-gray-600">No vehicles found in this area.</p>}
      </div>
    </div>
  )
}

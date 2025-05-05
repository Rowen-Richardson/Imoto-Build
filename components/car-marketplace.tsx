"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Search, X, ChevronDown, Truck, CarIcon, Bike, Facebook, Instagram, Twitter } from "lucide-react"
import VehicleDetails from "./vehicle-details"
import LocationPage from "./location-page"
import LoginPage from "./login-page"
import Dashboard from "./dashboard"
import { vehicles } from "@/lib/data"
import type { Vehicle } from "@/lib/data"
import type { UserProfile } from "./dashboard"; // Import UserProfile from dashboard.tsx
import { Header } from "./ui/header"

// Define the user state type more explicitly, matching UserProfile
type UserState = UserProfile | null

export default function CarMarketplace() {
  const [search, setSearch] = useState("") // Keep track of the search string used for display
  const [showMoreOptions, setShowMoreOptions] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null) // For province page navigation
  const [showLogin, setShowLogin] = useState(false)
  const [showDashboard, setShowDashboard] = useState(false)
  const [user, setUser] = useState<UserState>(null)
  const [filteredVehicles, setFilteredVehicles] = useState(vehicles)
  const [isSearchPage, setIsSearchPage] = useState(true)

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTerms, setSelectedTerms] = useState<string[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [bodyType, setBodyType] = useState("") // State for selected body type filter
  const [showBodyTypes, setShowBodyTypes] = useState(false) // State for body type dropdown visibility
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
        setShowBodyTypes(false) // Also hide body types dropdown
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Initialize vehicles on mount
  useEffect(() => {
    setFilteredVehicles(vehicles)
  }, [])

  const generateSuggestions = (input: string) => {
    if (!input.trim()) {
      setSuggestions([])
      return
    }

    const lowerInput = input.toLowerCase()
    const uniqueSuggestions = new Set<string>()

    vehicles.forEach((vehicle) => {
      // Suggest Make
      if (vehicle.make.toLowerCase().includes(lowerInput)) {
        uniqueSuggestions.add(vehicle.make)
      }
      // Suggest Make + Model
      const modelTerm = `${vehicle.make} ${vehicle.model}`
      if (modelTerm.toLowerCase().includes(lowerInput)) {
        uniqueSuggestions.add(modelTerm)
      }
      // Suggest Make + Model + Variant (if variant exists)
      if (vehicle.variant) {
         const variantTerm = `${vehicle.make} ${vehicle.model} ${vehicle.variant}`
         if (variantTerm.toLowerCase().includes(lowerInput)) {
           uniqueSuggestions.add(variantTerm)
         }
      }
    })

    // Filter out already selected terms
    const filteredSuggestions = [...uniqueSuggestions].filter(s => !selectedTerms.includes(s));

    setSuggestions(filteredSuggestions.slice(0, 5)) // Limit suggestions
  }


  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    generateSuggestions(value)
    setShowSuggestions(true)
  }

  const removeSelectedTerm = (term: string) => {
    setSelectedTerms(selectedTerms.filter((t) => t !== term))
  }

  const handleSearch = () => {
    // Get values from inputs/selects
    const minPriceInput = document.getElementById("min-price-input") as HTMLInputElement
    const maxPriceInput = document.getElementById("max-price-input") as HTMLInputElement
    const locationSelect = document.getElementById("location-select") as HTMLSelectElement; // Get location select
    // Get additional filter values (ensure IDs match the elements)
    const fuelTypeSelect = document.getElementById("fuel-type-select") as HTMLSelectElement;
    const engineCapacitySelect = document.getElementById("engine-capacity-select") as HTMLSelectElement;
    const transmissionSelect = document.getElementById("transmission-select") as HTMLSelectElement;
    const conditionSelect = document.getElementById("condition-select") as HTMLSelectElement;
    const minYearSelect = document.getElementById("min-year-select") as HTMLSelectElement;
    const maxYearSelect = document.getElementById("max-year-select") as HTMLSelectElement;
    const minMileageInput = document.getElementById("min-mileage-input") as HTMLInputElement;
    const maxMileageInput = document.getElementById("max-mileage-input") as HTMLInputElement;

    // Parse values, providing defaults or null
    const minPrice = minPriceInput?.value ? Number.parseInt(minPriceInput.value.replace(/\D/g, "")) : null;
    const maxPrice = maxPriceInput?.value ? Number.parseInt(maxPriceInput.value.replace(/\D/g, "")) : null;
    const selectedProvinceValue = locationSelect?.value || ""; // Get selected province, default to "" (All)

    const fuelType = fuelTypeSelect?.value || "All";
    const engineCapacity = engineCapacitySelect?.value || "All"; // Example: "1.6-2.0" or "All"
    const transmission = transmissionSelect?.value || "All";
    const condition = conditionSelect?.value || "All";
    const minYear = minYearSelect?.value ? parseInt(minYearSelect.value) : null;
    const maxYear = maxYearSelect?.value ? parseInt(maxYearSelect.value) : null;
    // Use replace(/\D/g, '') for mileage to strip non-digits before parsing
    const minMileage = minMileageInput?.value ? parseInt(minMileageInput.value.replace(/\D/g, ''), 10) : null;
    const maxMileage = maxMileageInput?.value ? parseInt(maxMileageInput.value.replace(/\D/g, ''), 10) : null;

    // Combine selected terms for filtering text
    const searchString = selectedTerms.join(" ").toLowerCase()

    // Apply filters
    const filtered = vehicles.filter((vehicle) => {
      // 1. Text Search (Make, Model, Variant)
      const vehicleText = `${vehicle.make} ${vehicle.model} ${vehicle.variant || ''}`.toLowerCase()
      const matchesSearch = !searchString || selectedTerms.every(term => vehicleText.includes(term.toLowerCase()));

      // 2. Province Filter
      const matchesProvince = !selectedProvinceValue || vehicle.province === selectedProvinceValue

      // 3. Body Type Filter (using state `bodyType`)
      const matchesBodyType = !bodyType || (vehicle.bodyType && vehicle.bodyType === bodyType)

      // 4. Price Filter
      const vehiclePrice = Number.parseInt(vehicle.price.replace(/\D/g, "")) // Ensure price is parsed correctly
      const matchesMinPrice = minPrice === null || isNaN(vehiclePrice) || vehiclePrice >= minPrice
      const matchesMaxPrice = maxPrice === null || isNaN(vehiclePrice) || vehiclePrice <= maxPrice

      // 5. Year Filter
      const vehicleYear = vehicle.year; // Assuming year is a number
      const matchesMinYear = minYear === null || vehicleYear >= minYear;
      const matchesMaxYear = maxYear === null || vehicleYear <= maxYear;

      // 6. Mileage Filter
      const vehicleMileage = parseInt(vehicle.mileage.replace(/\D/g, ''), 10); // Parse mileage as number
      const matchesMinMileage = minMileage === null || isNaN(vehicleMileage) || vehicleMileage >= minMileage;
      const matchesMaxMileage = maxMileage === null || isNaN(vehicleMileage) || vehicleMileage <= maxMileage;

      // 7. Fuel Type Filter
      const matchesFuelType = fuelType === "All" || vehicle.fuel === fuelType;

      // 8. Engine Capacity Filter
      const matchesEngineCapacity = engineCapacity === "All" || vehicle.engineCapacity === engineCapacity;

      // 9. Transmission Filter
      const matchesTransmission = transmission === "All" || vehicle.transmission === transmission;

      // Combine all filters
      return matchesSearch
          && matchesProvince
          && matchesBodyType
          && matchesMinPrice
          && matchesMaxPrice
          && matchesMinYear
          && matchesMaxYear
          && matchesMinMileage
          && matchesMaxMileage
          && matchesFuelType
          && matchesEngineCapacity
          && matchesTransmission;
    })

    setFilteredVehicles(filtered)
    setSearch(searchString || "All Vehicles") // Store the combined search terms used or a default
    setIsSearchPage(false) // Show results page
    setShowSuggestions(false) // Hide suggestions after search
    setShowBodyTypes(false) // Hide body type dropdown
  }


  const handleSuggestionClick = (suggestion: string) => {
    if (!selectedTerms.includes(suggestion)) {
      setSelectedTerms([...selectedTerms, suggestion])
    }
    setSearchTerm("")
    setSuggestions([])
    setShowSuggestions(false)
  }

  const bodyTypes = [
    { name: "All body types", icon: CarIcon },
    { name: "Sedan", icon: CarIcon },
    { name: "SUV", icon: CarIcon },
    { name: "Truck", icon: Truck },
    { name: "Motorcycle", icon: Bike },
    { name: "Hatchback", icon: CarIcon },
    { name: "Convertible", icon: CarIcon },
    // Add more as needed
  ]

  // When a user logs in, save their details including login method.
  const handleLoginSuccess = (userData: UserProfile) => { // Expect UserProfile
    console.log("Login Success:", userData)
    setUser(userData) // Store the full user profile
    setShowLogin(false)
    setShowDashboard(true) // Go directly to dashboard after login
    setIsSearchPage(false) // Ensure we are not on the search page background
  }

  // Function to update user state from Dashboard/ProfileSettings
  const handleUserUpdate = (updatedData: Partial<UserProfile>) => {
    setUser(prevUser => {
      if (!prevUser) return null; // Should not happen if called from Dashboard
      const newUser = { ...prevUser, ...updatedData };
      console.log("User state updated in CarMarketplace:", newUser);
      // TODO: Persist these changes to your backend/localStorage here
      // Example: localStorage.setItem('userProfile', JSON.stringify(newUser));
      // Example: await api.updateUserProfile(newUser);
      return newUser;
    });
  }

  const handleSignOut = () => {
    setUser(null)
    // TODO: Clear any persisted user data (localStorage, etc.)
    // Example: localStorage.removeItem('userProfile');
    setShowDashboard(false)
    setIsSearchPage(true) // Go back to the main search page view
  }

  // --- Routing Logic ---
  if (selectedProvince) {
    return (
      <>
        {/* Pass user state to Header */}
        <Header
          user={user}
          onLoginClick={() => setShowLogin(true)}
          onDashboardClick={() => user ? setShowDashboard(true) : setShowLogin(true)}
          onGoHome={() => setIsSearchPage(true)}
          onShowAllCars={() => { setFilteredVehicles(vehicles); setIsSearchPage(false); }}
          onGoToSellPage={() => alert("Sell page not implemented")}
          onSignOut={handleSignOut}
        />
        <div className="pt-16 md:pt-20">
          {/* Pass province string directly */}
          <LocationPage
            province={selectedProvince}
            vehicles={vehicles}
            onBack={() => setSelectedProvince(null)}
            user={user}
            // Pass Header navigation props
            onLoginClick={() => setShowLogin(true)}
            onDashboardClick={() => user ? setShowDashboard(true) : setShowLogin(true)}
            onGoHome={() => setIsSearchPage(true)}
            onShowAllCars={() => { setFilteredVehicles(vehicles); setIsSearchPage(false); }}
            onGoToSellPage={() => alert("Sell page not implemented")}
            onSignOut={handleSignOut}
          />
        </div>
      </>
    )
  }

  if (selectedVehicle) {
    return (
      <>
        {/* Pass user state to Header */}
        <Header
          user={user}
          onLoginClick={() => setShowLogin(true)}
          onDashboardClick={() => user ? setShowDashboard(true) : setShowLogin(true)}
          onGoHome={() => setIsSearchPage(true)}
          onShowAllCars={() => { setFilteredVehicles(vehicles); setIsSearchPage(false); }}
          onGoToSellPage={() => alert("Sell page not implemented")}
          onSignOut={handleSignOut}
        />
        <div className="pt-16 md:pt-20">
          <VehicleDetails vehicle={selectedVehicle} onBack={() => setSelectedVehicle(null)} user={user} /> {/* Pass user prop */}
        </div>
      </>
    )
  }

  if (showLogin) {
    // Pass the updated handleLoginSuccess and Header navigation props
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onCancel={() => setShowLogin(false)}
        onDashboardClick={() => user ? setShowDashboard(true) : setShowLogin(true)} // Keep existing logic
        onGoHome={() => setIsSearchPage(true)} // Go back to main search page
        onShowAllCars={() => { setFilteredVehicles(vehicles); setIsSearchPage(false); }} // Show all cars
        onGoToSellPage={() => alert("Sell page not implemented")} // Placeholder
        onSignOut={handleSignOut} // Pass sign out handler
      />
    );
  }

  if (showDashboard && user) {
    return (
      <Dashboard
        user={user} // Pass the full user object state
        onSignOut={handleSignOut}
        onBack={() => { // Back from dashboard goes to search results or main page
            setShowDashboard(false);
            // Go back to the main search page for simplicity
            setIsSearchPage(true);
            // Optionally reset filters or keep last results state
            // setFilteredVehicles(vehicles); // Resetting here
        }}
        onUserUpdate={handleUserUpdate} // Pass the update handler
        // Pass Header navigation props
        onLoginClick={() => setShowLogin(true)} // Show login page
        onGoHome={() => setIsSearchPage(true)} // Go back to main search page
        onShowAllCars={() => { setFilteredVehicles(vehicles); setIsSearchPage(false); }} // Show all cars
        onGoToSellPage={() => alert("Sell page not implemented")} // Placeholder
      />
    )
  }

  // --- Main Search Page or Results Page ---
  return (
    <div className="min-h-screen bg-[var(--light-bg)] dark:bg-[var(--dark-bg)]">
      <Header
        user={user}
        onLoginClick={() => setShowLogin(true)}
        onDashboardClick={() => user ? setShowDashboard(true) : setShowLogin(true)} // Show dashboard if logged in, else login
        onGoHome={() => setIsSearchPage(true)} // Go back to main search page
        onShowAllCars={() => { setFilteredVehicles(vehicles); setIsSearchPage(false); }} // Show all cars
        onGoToSellPage={() => alert("Sell page not implemented")} // Placeholder
        onSignOut={handleSignOut} // Pass sign out handler
        transparent={isSearchPage} // Header is transparent only on the initial search page
      />

      {isSearchPage ? (
        // --- Search Page View ---
        <div className="flex flex-col">
          {/* Hero Search Section */}
          <div className="min-h-screen flex flex-col items-center justify-center px-4 py-20 bg-gradient-to-b from-white dark:from-[#182218] to-[var(--light-bg)] dark:to-[var(--dark-bg)]">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[#3E5641] dark:text-white">Find Your Perfect Car</h1>
              <p className="text-xl opacity-80 text-[#6F7F69] dark:text-gray-300">Search from thousands of vehicles across South Africa</p>
            </div>

            {/* Search Card */}
            <div className="bg-white dark:bg-[#1F2B20] p-6 md:p-8 rounded-2xl shadow-xl max-w-3xl w-full border border-[#9FA791]/20 dark:border-[#4A4D45]/20">
              {/* Search Input with Suggestions */}
              <div className="mb-4 relative" ref={searchRef}>
                <label htmlFor="search-input" className="sr-only">Search Make, Model and Variant</label>
                <div className="flex flex-wrap items-center gap-2 p-3 border border-[#9FA791] dark:border-[#4A4D45] rounded-lg focus-within:border-[#FF6700] dark:focus-within:border-[#FF7D33] mb-2 bg-white dark:bg-[#2A352A]">
                  {selectedTerms.map((term, index) => (
                    <div
                      key={index}
                      className="flex items-center bg-[#FFF8E0] dark:bg-[#3E5641] px-3 py-1.5 rounded-full text-sm text-[#3E5641] dark:text-white"
                    >
                      <span>{term}</span>
                      <button
                        onClick={() => removeSelectedTerm(term)}
                        className="ml-2 hover:text-[#FF6700] dark:hover:text-[#FF7D33] focus:outline-none"
                        aria-label={`Remove ${term}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <input
                    id="search-input"
                    type="text"
                    placeholder={selectedTerms.length > 0 ? "" : "Search Make, Model, Variant..."}
                    value={searchTerm}
                    onChange={handleSearchInputChange}
                    onFocus={() => setShowSuggestions(true)} // Show suggestions on focus
                    className="flex-1 min-w-[150px] px-2 py-1 focus:outline-none bg-transparent text-[#3E5641] dark:text-white placeholder-[#6F7F69] dark:placeholder-gray-400"
                  />
                </div>

                {/* Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-20 w-full bg-white dark:bg-[#1F2B20] border border-[#9FA791] dark:border-[#4A4D45] rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="px-4 py-3 hover:bg-[#FFF8E0] dark:hover:bg-[#2A352A] cursor-pointer text-[#3E5641] dark:text-white"
                        onClick={() => handleSuggestionClick(suggestion)}
                        // Use mouse down to prevent input blur closing suggestions before click registers
                        onMouseDown={(e) => e.preventDefault()}
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Filters Row (Price, Location, Body Type) */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                 <input
                    id="min-price-input" // ID added
                    type="number"
                    placeholder="Min Price"
                    className="px-4 py-3 rounded-lg border border-[#9FA791] dark:border-[#4A4D45] focus:outline-none focus:border-[#FF6700] dark:focus:border-[#FF7D33] bg-white dark:bg-[#2A352A] text-[#3E5641] dark:text-white placeholder-[#6F7F69] dark:placeholder-gray-400"
                    min="0"
                    step="1000"
                 />
                 <input
                    id="max-price-input" // ID added
                    type="number"
                    placeholder="Max Price"
                    className="px-4 py-3 rounded-lg border border-[#9FA791] dark:border-[#4A4D45] focus:outline-none focus:border-[#FF6700] dark:focus:border-[#FF7D33] bg-white dark:bg-[#2A352A] text-[#3E5641] dark:text-white placeholder-[#6F7F69] dark:placeholder-gray-400"
                    min="0"
                    step="1000"
                 />
                <select
                  id="location-select" // ID added
                  className="w-full px-4 py-3 rounded-lg border border-[#9FA791] dark:border-[#4A4D45] focus:outline-none focus:border-[#FF6700] dark:focus:border-[#FF7D33] appearance-none bg-white dark:bg-[#2A352A] text-[#3E5641] dark:text-white"
                  defaultValue=""
                >
                  <option value="">Location (All)</option>
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
                {/* Body Type Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowBodyTypes(!showBodyTypes)}
                    className="w-full px-4 py-3 rounded-lg border border-[#9FA791] dark:border-[#4A4D45] focus:outline-none focus:border-[#FF6700] dark:focus:border-[#FF7D33] text-left flex justify-between items-center bg-white dark:bg-[#2A352A] text-[#3E5641] dark:text-white"
                    aria-haspopup="listbox"
                    aria-expanded={showBodyTypes}
                  >
                    {bodyType || "All body types"}
                    <ChevronDown className={`w-4 h-4 transition-transform ${showBodyTypes ? 'rotate-180' : ''}`} />
                  </button>

                  {showBodyTypes && (
                    <div className="absolute z-20 w-full bg-white dark:bg-[#1F2B20] border border-[#9FA791] dark:border-[#4A4D45] rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto" role="listbox">
                      {bodyTypes.map((type, index) => (
                        <div
                          key={index}
                          className="px-4 py-3 hover:bg-[#FFF8E0] dark:hover:bg-[#2A352A] cursor-pointer flex items-center text-[#3E5641] dark:text-white"
                          onClick={() => {
                            setBodyType(type.name === "All body types" ? "" : type.name) // Set empty string for "All"
                            setShowBodyTypes(false)
                          }}
                          role="option"
                          aria-selected={bodyType === type.name}
                          onMouseDown={(e) => e.preventDefault()}
                        >
                          <type.icon className="w-4 h-4 mr-2 opacity-70" />
                          {type.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* More Options Section */}
              {showMoreOptions && (
                <div id="more-options-section" className="mt-6 border-t border-[#9FA791]/20 dark:border-[#4A4D45]/20 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    {/* Min/Max Year */}
                    <div className="flex flex-col">
                      <label htmlFor="min-year-select" className="mb-1 font-medium text-sm text-[#6F7F69] dark:text-gray-300">Min Year</label>
                      <select id="min-year-select" className="px-4 py-3 rounded-lg border border-[#9FA791] dark:border-[#4A4D45] focus:outline-none focus:border-[#FF6700] dark:focus:border-[#FF7D33] bg-white dark:bg-[#2A352A] text-[#3E5641] dark:text-white">
                        <option value="">Any</option>
                        {/* Generate year options dynamically */}
                        {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col">
                      <label htmlFor="max-year-select" className="mb-1 font-medium text-sm text-[#6F7F69] dark:text-gray-300">Max Year</label>
                      <select id="max-year-select" className="px-4 py-3 rounded-lg border border-[#9FA791] dark:border-[#4A4D45] focus:outline-none focus:border-[#FF6700] dark:focus:border-[#FF7D33] bg-white dark:bg-[#2A352A] text-[#3E5641] dark:text-white">
                        <option value="">Any</option>
                        {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                    {/* Min/Max Mileage */}
                    <div className="flex flex-col">
                      <label htmlFor="min-mileage-input" className="mb-1 font-medium text-sm text-[#6F7F69] dark:text-gray-300">Min Mileage</label>
                      <input
                        id="min-mileage-input"
                        type="number"
                        placeholder="e.g., 10000"
                        min="0"
                        step="1000"
                        className="px-4 py-3 rounded-lg border border-[#9FA791] dark:border-[#4A4D45] focus:outline-none focus:border-[#FF6700] dark:focus:border-[#FF7D33] bg-white dark:bg-[#2A352A] text-[#3E5641] dark:text-white placeholder-[#6F7F69] dark:placeholder-gray-400"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label htmlFor="max-mileage-input" className="mb-1 font-medium text-sm text-[#6F7F69] dark:text-gray-300">Max Mileage</label>
                      <input
                        id="max-mileage-input"
                        type="number"
                        placeholder="e.g., 100000"
                        min="0"
                        step="1000"
                        className="px-4 py-3 rounded-lg border border-[#9FA791] dark:border-[#4A4D45] focus:outline-none focus:border-[#FF6700] dark:focus:border-[#FF7D33] bg-white dark:bg-[#2A352A] text-[#3E5641] dark:text-white placeholder-[#6F7F69] dark:placeholder-gray-400"
                      />
                    </div>
                    {/* Fuel Type */}
                    <div className="flex flex-col">
                      <label htmlFor="fuel-type-select" className="mb-1 font-medium text-sm text-[#6F7F69] dark:text-gray-300">Fuel Type</label>
                      <select id="fuel-type-select" className="px-4 py-3 rounded-lg border border-[#9FA791] dark:border-[#4A4D45] focus:outline-none focus:border-[#FF6700] dark:focus:border-[#FF7D33] bg-white dark:bg-[#2A352A] text-[#3E5641] dark:text-white">
                        <option value="All">All</option>
                        <option value="Petrol">Petrol</option>
                        <option value="Diesel">Diesel</option>
                        <option value="Electric">Electric</option>
                        <option value="Hybrid">Hybrid</option>
                      </select>
                    </div>
                    {/* Engine Capacity */}
                    <div className="flex flex-col">
                      <label htmlFor="engine-capacity-select" className="mb-1 font-medium text-sm text-[#6F7F69] dark:text-gray-300">Engine Capacity</label>
                      <select id="engine-capacity-select" className="px-4 py-3 rounded-lg border border-[#9FA791] dark:border-[#4A4D45] focus:outline-none focus:border-[#FF6700] dark:focus:border-[#FF7D33] bg-white dark:bg-[#2A352A] text-[#3E5641] dark:text-white">
                        <option value="All">All</option>
                        <option value="1.0-1.5">1.0L - 1.5L</option>
                        <option value="1.6-2.0">1.6L - 2.0L</option>
                        <option value="2.1-3.0">2.1L - 3.0L</option>
                        <option value="3.1+">3.1L+</option>
                      </select>
                    </div>
                    {/* Transmission */}
                    <div className="flex flex-col">
                      <label htmlFor="transmission-select" className="mb-1 font-medium text-sm text-[#6F7F69] dark:text-gray-300">Transmission</label>
                      <select id="transmission-select" className="px-4 py-3 rounded-lg border border-[#9FA791] dark:border-[#4A4D45] focus:outline-none focus:border-[#FF6700] dark:focus:border-[#FF7D33] bg-white dark:bg-[#2A352A] text-[#3E5641] dark:text-white">
                        <option value="All">All</option>
                        <option value="Manual">Manual</option>
                        <option value="Automatic">Automatic</option>
                      </select>
                    </div>
                    {/* Condition */}
                    <div className="flex flex-col">
                      <label htmlFor="condition-select" className="mb-1 font-medium text-sm text-[#6F7F69] dark:text-gray-300">Condition</label>
                      <select id="condition-select" className="px-4 py-3 rounded-lg border border-[#9FA791] dark:border-[#4A4D45] focus:outline-none focus:border-[#FF6700] dark:focus:border-[#FF7D33] bg-white dark:bg-[#2A352A] text-[#3E5641] dark:text-white">
                        <option value="All">All</option>
                        <option value="New">New</option>
                        <option value="Used">Used</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <button
                  onClick={() => setShowMoreOptions(!showMoreOptions)}
                  className="border border-[#FF6700] text-[#FF6700] dark:border-[#FF7D33] dark:text-[#FF7D33] px-4 py-3 rounded-lg w-full sm:w-auto sm:flex-1 hover:bg-[#FFF8E0] dark:hover:bg-[#2A352A] transition-colors font-medium"
                  aria-controls="more-options-section"
                  aria-expanded={showMoreOptions}
                >
                  {showMoreOptions ? "Fewer Options" : "More Options"}
                </button>
                <button
                  onClick={handleSearch}
                  className="bg-[#FF6700] text-white dark:bg-[#FF7D33] px-4 py-3 rounded-lg w-full sm:w-auto sm:flex-[2] hover:bg-[#FF6700]/90 dark:hover:bg-[#FF7D33]/90 transition-colors flex items-center justify-center font-medium"
                >
                  <Search className="w-5 h-5 mr-2" />
                  Search Cars
                </button>
              </div>
            </div>
          </div>

          {/* Featured Vehicles Section */}
          <div className="py-16 px-4 bg-white dark:bg-[#1F2B20]">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4 text-[#3E5641] dark:text-white">Featured Vehicles</h2>
                <p className="text-lg opacity-80 max-w-2xl mx-auto text-[#6F7F69] dark:text-gray-300">
                  Discover our handpicked selection of premium vehicles available across South Africa
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Display first 6 vehicles as featured */}
                {vehicles.slice(0, 6).map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className="bg-white dark:bg-[#2A352A] border border-[#9FA791]/20 dark:border-[#4A4D45]/20 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer flex flex-col overflow-hidden group"
                    onClick={() => setSelectedVehicle(vehicle)}
                  >
                    <div className="relative h-48 w-full overflow-hidden">
                       <img
                          src={vehicle.image || "/placeholder.svg"} // Use placeholder if no image
                          alt={`${vehicle.make} ${vehicle.model} ${vehicle.variant || ''}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                       />
                    </div>
                    <div className="p-4 flex flex-col flex-grow">
                      <h3 className="text-lg font-semibold mb-2 text-[#3E5641] dark:text-white">
                        {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.variant || ''}
                      </h3>
                      <p className="text-[#FF6700] dark:text-[#FF7D33] font-bold text-lg mb-3">{vehicle.price}</p>
                      <div className="text-sm opacity-70 text-[#6F7F69] dark:text-gray-300 mb-4">
                         {vehicle.mileage} km &bull; {vehicle.transmission} &bull; {vehicle.fuel}
                      </div>
                      <div className="flex justify-between items-center mt-auto pt-2 border-t border-[#9FA791]/10 dark:border-[#4A4D45]/20">
                        <span className="text-sm opacity-70 text-[#6F7F69] dark:text-gray-400">
                          {vehicle.city}, {vehicle.province}
                        </span>
                        <button
                          // onClick handled by parent div
                          className="bg-[#FF6700] dark:bg-[#FF7D33] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#FF6700]/90 dark:hover:bg-[#FF7D33]/90 transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center mt-12">
                <button
                  onClick={() => {
                      setFilteredVehicles(vehicles); // Show all vehicles
                      setIsSearchPage(false); // Go to results view
                      window.scrollTo(0, 0); // Scroll to top
                  }}
                  className="bg-[#3E5641] dark:bg-[#4A4D45] text-white px-6 py-3 rounded-lg hover:bg-[#3E5641]/90 dark:hover:bg-[#4A4D45]/90 transition-colors font-medium"
                >
                  View All Vehicles
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="bg-[#3E5641] dark:bg-[#1F2B20] py-8 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                  <h3 className="text-xl font-bold mb-4 text-[#FF6700] dark:text-[#FF7D33]">imoto</h3>
                  <p className="text-sm text-gray-300">The simplest way to buy or sell your car in South Africa.</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-4 text-gray-200">Quick Links</h4>
                  <ul className="space-y-2">
                    <li><a href="#" className="text-sm text-gray-300 hover:text-[#FF7D33]">Buy a Car</a></li>
                    <li><a href="#" className="text-sm text-gray-300 hover:text-[#FF7D33]">Sell a Car</a></li>
                    <li><a href="#" className="text-sm text-gray-300 hover:text-[#FF7D33]">Value My Car</a></li>
                    <li><a href="#" className="text-sm text-gray-300 hover:text-[#FF7D33]">Car Finance</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-4 text-gray-200">About Us</h4>
                   <ul className="space-y-2">
                    <li><a href="#" className="text-sm text-gray-300 hover:text-[#FF7D33]">Our Story</a></li>
                    <li><a href="#" className="text-sm text-gray-300 hover:text-[#FF7D33]">Careers</a></li>
                    <li><a href="#" className="text-sm text-gray-300 hover:text-[#FF7D33]">Press</a></li>
                    <li><a href="#" className="text-sm text-gray-300 hover:text-[#FF7D33]">Contact Us</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-4 text-gray-200">Connect With Us</h4>
                  <div className="flex space-x-4">
                    <a href="#" className="text-gray-300 hover:text-[#FF7D33]"><Facebook className="w-6 h-6" /></a>
                    <a href="#" className="text-gray-300 hover:text-[#FF7D33]"><Instagram className="w-6 h-6" /></a>
                    <a href="#" className="text-gray-300 hover:text-[#FF7D33]"><Twitter className="w-6 h-6" /></a>
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-8 border-t border-[#576B55]/50 dark:border-[#2A352A]/50 text-center text-sm text-gray-400">
                <p>&copy; {new Date().getFullYear()} imoto. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </div>
      ) : (
        // --- Results Page View ---
        <div className="pt-24 pb-10 min-h-[calc(100vh-150px)]"> {/* Adjust padding and min-height */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                  <button
                      onClick={() => {
                          setIsSearchPage(true); // Go back to search form
                          // Optionally clear filters here if desired
                          // setSelectedTerms([]);
                          // setBodyType("");
                          // etc.
                      }}
                      className="text-sm text-[#FF6700] dark:text-[#FF7D33] hover:underline mb-2 inline-flex items-center"
                  >
                      &larr; Back to Search Form
                  </button>
                  <h2 className="text-2xl font-bold text-[#3E5641] dark:text-white">Search Results</h2>
                  <p className="text-sm opacity-70 text-[#6F7F69] dark:text-gray-300">
                    {filteredVehicles.length} vehicle{filteredVehicles.length !== 1 ? 's' : ''} found
                    {/* Display the search terms used */}
                    {search && search !== "All Vehicles" ? ` for "${search}"` : ""}
                  </p>
              </div>
               {/* Optional: Add sort/filter controls for results here */}
            </div>

            {/* Results Grid or No Results Message */}
            {filteredVehicles.length === 0 ? (
               <div className="text-center py-16">
                 <Search className="w-16 h-16 mx-auto mb-4 opacity-30 text-[#6F7F69] dark:text-gray-500" />
                 <h3 className="text-xl font-semibold mb-2 text-[#3E5641] dark:text-white">No vehicles found</h3>
                 <p className="opacity-70 mb-6 text-[#6F7F69] dark:text-gray-300">Try adjusting your search criteria or browse all vehicles.</p>
                 <button
                   onClick={() => setIsSearchPage(true)} // Go back to search form
                   className="bg-[#FF6700] dark:bg-[#FF7D33] text-white px-6 py-3 rounded-lg hover:bg-[#FF6700]/90 dark:hover:bg-[#FF7D33]/90 transition-colors font-medium"
                 >
                   Refine Search
                 </button>
               </div>
            ) : (
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                 {filteredVehicles.map((vehicle) => (
                   <div
                     key={vehicle.id}
                     className="bg-white dark:bg-[#2A352A] border border-[#9FA791]/20 dark:border-[#4A4D45]/20 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer flex flex-col overflow-hidden group"
                     onClick={() => setSelectedVehicle(vehicle)}
                   >
                     <div className="relative h-48 w-full overflow-hidden">
                       <img
                          src={vehicle.image || "/placeholder.svg"}
                          alt={`${vehicle.make} ${vehicle.model}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                       />
                     </div>
                     <div className="p-4 flex flex-col flex-grow">
                       <h3 className="text-lg font-semibold mb-2 text-[#3E5641] dark:text-white">
                         {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.variant || ''}
                       </h3>
                       <p className="text-[#FF6700] dark:text-[#FF7D33] font-bold text-lg mb-3">{vehicle.price}</p>
                       <div className="text-sm opacity-70 text-[#6F7F69] dark:text-gray-300 mb-4">
                         {vehicle.mileage} km &bull; {vehicle.transmission} &bull; {vehicle.fuel}
                       </div>
                       <div className="flex justify-between items-center mt-auto pt-2 border-t border-[#9FA791]/10 dark:border-[#4A4D45]/20">
                         <span className="text-sm opacity-70 text-[#6F7F69] dark:text-gray-400">
                           {vehicle.city}, {vehicle.province}
                         </span>
                         <span className="text-sm font-medium text-[#FF6700] dark:text-[#FF7D33]">
                           View Details &rarr;
                         </span>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

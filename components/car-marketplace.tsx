"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import * as SliderPrimitive from "@radix-ui/react-slider";
import { Search, X, ChevronDown, Truck, CarIcon, Bike, Facebook, Instagram, Twitter } from "lucide-react"
import VehicleDetails from "./vehicle-details"
import LocationPage from "./location-page"
import LoginPage from "./login-page"
import Dashboard from "./dashboard"
import UploadVehicle from "./upload-vehicle"; // Import the new UploadVehicle component
import { vehicles } from "@/lib/data"
import type { Vehicle } from "@/lib/data"

// Common South African car make abbreviations
const MAKE_ABBREVIATIONS: Record<string, string> = {
  vw: "Volkswagen",
  bmw: "BMW",
  merc: "Mercedes Benz",
  benz: "Mercedes Benz",
  toy: "Toyota",
  ford: "Ford",
  chev: "Chevrolet",
  caddy: "Cadillac",
  audi: "Audi",
  tata: "Tata Motors",
  maz: "Mazda",
  suz: "Suzuki",
  hyundai: "Hyundai",
  kia: "Kia",
  ren: "Renault",
  nissan: "Nissan",
  honda: "Honda",
  opel: "Opel",
  fiat: "Fiat",
  jeep: "Jeep",
  jag: "Jaguar",
  landy: "Land Rover",
  lr: "Land Rover",
  lex: "Lexus",
  dacia: "Dacia",
  mini: "MINI",
  // Add more as needed
};
import type { UserProfile } from "@/types/user"; // Import UserProfile from shared types
import { useUser } from "@/components/UserContext";
import { Header } from "./ui/header"
import ProfileSettings from "./profile-settings"; // Import ProfileSettings component

// Define the user state type more explicitly, matching UserProfile


export default function CarMarketplace() {
  const [search, setSearch] = useState("") // Keep track of the search string used for display
  const [showMoreOptions, setShowMoreOptions] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null) // For province page navigation
  const [showLogin, setShowLogin] = useState(false)
  const [showDashboard, setShowDashboard] = useState(false)
  const [showProfileSettings, setShowProfileSettings] = useState(false) // New state for Profile Settings
  const [showUploadVehicle, setShowUploadVehicle] = useState(false); // New state for Upload Vehicle page
  const [vehicleToEdit, setVehicleToEdit] = useState<Vehicle | null>(null); // State for the vehicle being edited
  const { user, setUser } = useUser();
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>(vehicles); // State to hold all vehicles
  const [userListedCars, setUserListedCars] = useState<Vehicle[]>([]); // State to hold cars listed by the current user
  const [filteredVehicles, setFilteredVehicles] = useState(vehicles)
  const [isSearchPage, setIsSearchPage] = useState(true)
  const [savedCars, setSavedCars] = useState<Vehicle[]>([]); // State to hold saved cars

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTerms, setSelectedTerms] = useState<string[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [bodyType, setBodyType] = useState("") // State for selected body type filter
  const [showBodyTypes, setShowBodyTypes] = useState(false) // State for body type dropdown visibility
  const searchRef = useRef<HTMLDivElement>(null)
  const engineCapacityRef = useRef<HTMLDivElement>(null);

  // Track if login was triggered by "Sell a Car"/Upload Vehicle
  const [loginContext, setLoginContext] = useState<'sell' | 'default'>("default");

  // State for Engine Capacity Slider
  const [engineCapacityRange, setEngineCapacityRange] = useState<[number, number]>([1.0, 8.0]);
  const [showEngineCapacitySlider, setShowEngineCapacitySlider] = useState(false);
  const [currentSliderEngineValues, setCurrentSliderEngineValues] = useState<[number, number]>([1.0, 8.0]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
        setShowBodyTypes(false) // Also hide body types dropdown
      }
      if (engineCapacityRef.current && !engineCapacityRef.current.contains(event.target as Node)) {
        if (showEngineCapacitySlider) { // Only apply if it was open
          setEngineCapacityRange(currentSliderEngineValues); // Auto-apply
          setShowEngineCapacitySlider(false);
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Helper function to format raw price string to "R X XXX.XX" for display
  const formatPriceForDisplay = (rawValue: string | number | undefined | null): string => {
    if (rawValue === undefined || rawValue === null || String(rawValue).trim() === "") {
      return "R 0.00"; // Default display for invalid/empty price
    }

    let numericString = String(rawValue).replace(/[^\d.]/g, ''); // Keep only digits and one dot

    if (numericString.startsWith('.')) {
      numericString = '0' + numericString;
    }

    const parts = numericString.split('.');
    let integerPart = parts[0];
    let decimalPart = parts.length > 1 ? parts[1] : "";

    if (integerPart === "" && decimalPart !== "") {
        integerPart = "0";
    }

    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");

    if (decimalPart.length === 0) {
      decimalPart = "00";
    } else if (decimalPart.length === 1) {
      decimalPart += "0";
    } else if (decimalPart.length > 2) {
      decimalPart = decimalPart.substring(0, 2);
    }
    return `R ${formattedInteger || "0"}.${decimalPart}`;
  };

  // Initialize filtered vehicles on mount or when allVehicles changes
  useEffect(() => {
    setFilteredVehicles(allVehicles)
  }, [allVehicles]) // Depend on allVehicles

  const generateSuggestions = (input: string) => {
    if (!input.trim()) {
      setSuggestions([])
      return
    }

    const lowerInput = input.toLowerCase();
    const uniqueSuggestions = new Set<string>();

    // Check if input matches an abbreviation
    const abbrFull = MAKE_ABBREVIATIONS[lowerInput];

    allVehicles.forEach((vehicle) => {
      // Suggest Make (with abbreviation support)
      if (
        vehicle.make.toLowerCase().includes(lowerInput) ||
        (abbrFull && vehicle.make.toLowerCase() === abbrFull.toLowerCase())
      ) {
        uniqueSuggestions.add(vehicle.make);
      }
      // Suggest Make + Model
      const modelTerm = `${vehicle.make} ${vehicle.model}`;
      if (
        modelTerm.toLowerCase().includes(lowerInput) ||
        (abbrFull && modelTerm.toLowerCase().includes(abbrFull.toLowerCase()))
      ) {
        uniqueSuggestions.add(modelTerm);
      }
      // Suggest Make + Model + Variant (if variant exists)
      if (vehicle.variant) {
        const variantTerm = `${vehicle.make} ${vehicle.model} ${vehicle.variant}`;
        if (
          variantTerm.toLowerCase().includes(lowerInput) ||
          (abbrFull && variantTerm.toLowerCase().includes(abbrFull.toLowerCase()))
        ) {
          uniqueSuggestions.add(variantTerm);
        }
      }
    });

    // Add abbreviation suggestion if not already present
    if (abbrFull && !uniqueSuggestions.has(abbrFull)) {
      uniqueSuggestions.add(abbrFull);
    }

    // Filter out already selected terms
    const filteredSuggestions = [...uniqueSuggestions].filter(s => !selectedTerms.includes(s));

    setSuggestions(filteredSuggestions.slice(0, 5)); // Limit suggestions
  };


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
    const minPriceInput = document.getElementById("min-price-input") as HTMLInputElement;
    const maxPriceInput = document.getElementById("max-price-input") as HTMLInputElement;
    const locationSelect = document.getElementById("location-select") as HTMLSelectElement;
    const fuelTypeSelect = document.getElementById("fuel-type-select") as HTMLSelectElement;    
    const transmissionSelect = document.getElementById("transmission-select") as HTMLSelectElement;
    const conditionSelect = document.getElementById("condition-select") as HTMLSelectElement;
    const minYearSelect = document.getElementById("min-year-select") as HTMLSelectElement;
    const maxYearSelect = document.getElementById("max-year-select") as HTMLSelectElement;
    const minMileageInput = document.getElementById("min-mileage-input") as HTMLInputElement;
    const maxMileageInput = document.getElementById("max-mileage-input") as HTMLInputElement;

    // Parse values, providing defaults or null
    const minPrice = minPriceInput?.value ? Number.parseInt(minPriceInput.value.replace(/\D/g, "")) : null;
    const maxPrice = maxPriceInput?.value ? Number.parseInt(maxPriceInput.value.replace(/\D/g, "")) : null;
    const selectedProvinceValue = locationSelect?.value || "";

    const fuelType = fuelTypeSelect?.value || "All";
    const transmission = transmissionSelect?.value || "All";
    const condition = conditionSelect?.value || "All";
    const minYear = minYearSelect?.value ? parseInt(minYearSelect.value) : null;
    const maxYear = maxYearSelect?.value ? parseInt(maxYearSelect.value) : null;
    const minMileage = minMileageInput?.value ? parseInt(minMileageInput.value.replace(/\D/g, ''), 10) : null;
    const maxMileage = maxMileageInput?.value ? parseInt(maxMileageInput.value.replace(/\D/g, ''), 10) : null;

    // Prepare search terms, expanding abbreviations
    const expandedTerms = selectedTerms.map(term => {
      const abbr = MAKE_ABBREVIATIONS[term.toLowerCase()];
      return abbr ? abbr : term;
    });
    const searchString = expandedTerms.join(", ").toLowerCase();

    // Apply filters
    const filtered = allVehicles.filter((vehicle) => {
      // 1. Text Search (Make, Model, Variant, with abbreviation support)
      const vehicleText = `${vehicle.make} ${vehicle.model} ${vehicle.variant || ''}`.toLowerCase();
      // Also build a string with abbreviations for make if available
      const makeAbbr = Object.entries(MAKE_ABBREVIATIONS).find(([, full]) => full.toLowerCase() === vehicle.make.toLowerCase());
      const abbrText = makeAbbr ? `${makeAbbr[0]} ${vehicle.model} ${vehicle.variant || ''}`.toLowerCase() : '';

      // OR logic: match if any term matches vehicleText or abbrText
      const matchesSearch =
        expandedTerms.length === 0 ||
        expandedTerms.some(term =>
          vehicleText.includes(term.toLowerCase()) ||
          (abbrText && abbrText.includes(term.toLowerCase()))
        );

      // 2. Province Filter
      const matchesProvince = !selectedProvinceValue || vehicle.province === selectedProvinceValue;

      // 3. Body Type Filter
      const matchesBodyType = !bodyType || (vehicle.bodyType && vehicle.bodyType === bodyType);

      // 4. Price Filter
      const vehiclePrice = vehicle.price != null ? Number.parseInt(String(vehicle.price).replace(/\D/g, "")) : NaN;
      const matchesMinPrice = minPrice === null || isNaN(vehiclePrice) || vehiclePrice >= minPrice;
      const matchesMaxPrice = maxPrice === null || isNaN(vehiclePrice) || vehiclePrice <= maxPrice;

      // 5. Year Filter
      const vehicleYear = vehicle.year;
      const matchesMinYear = minYear === null || vehicleYear >= minYear;
      const matchesMaxYear = maxYear === null || vehicleYear <= maxYear;

      // 6. Mileage Filter
      const vehicleMileage = vehicle.mileage != null ? parseInt(String(vehicle.mileage).replace(/\D/g, ''), 10) : NaN;
      const matchesMinMileage = minMileage === null || isNaN(vehicleMileage) || vehicleMileage >= minMileage;
      const matchesMaxMileage = maxMileage === null || isNaN(vehicleMileage) || vehicleMileage <= maxMileage;

      // 7. Fuel Type Filter
      const matchesFuelType = fuelType === "All" || vehicle.fuel === fuelType;

      // 8. Engine Capacity Filter (New Logic)
      const parseEngineCapacityToNumber = (ecString: string | undefined): number | null => {
        if (!ecString) return null;
        const cleanedString = String(ecString).toUpperCase().replace('L', '');
        const numericValue = parseFloat(cleanedString);
        return isNaN(numericValue) ? null : numericValue;
      };
      const vehicleEngineLiters = parseEngineCapacityToNumber(vehicle.engineCapacity);
      const matchesEngineCapacity = vehicleEngineLiters === null || (vehicleEngineLiters >= engineCapacityRange[0] && vehicleEngineLiters <= engineCapacityRange[1]);

      // 9. Transmission Filter
      const matchesTransmission = transmission === "All" || vehicle.transmission === transmission;

      return (
        matchesSearch &&
        matchesProvince &&
        matchesBodyType &&
        matchesMinPrice &&
        matchesMaxPrice &&
        matchesMinYear &&
        matchesMaxYear &&
        matchesMinMileage &&
        matchesMaxMileage &&
        matchesFuelType &&
        matchesEngineCapacity &&
        matchesTransmission
      );
    });

    setFilteredVehicles(filtered);
    setSearch(searchString || "All Vehicles");
    setIsSearchPage(false);
    setShowSuggestions(false);
    setShowBodyTypes(false);
  };


  const handleSuggestionClick = (suggestion: string) => {
    if (!selectedTerms.includes(suggestion)) {
      setSelectedTerms([...selectedTerms, suggestion])
    }
    setSearchTerm("")
    setSuggestions([])
    setShowSuggestions(false)
  }

  // Helper for Engine Capacity Display
  const formatEngineCapacityDisplay = (range: [number, number]): string => {
    if (range[0] === 1.0 && range[1] === 8.0) {
      return "All";
    }
    return `${range[0].toFixed(1)}L - ${range[1].toFixed(1)}L`;
  };

  const handleApplyEngineCapacity = () => {
    setEngineCapacityRange(currentSliderEngineValues);
    setShowEngineCapacitySlider(false);
  };

  const handleMinEngineInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newMin = parseFloat(e.target.value);
    if (isNaN(newMin)) newMin = 1.0;
    newMin = Math.max(1.0, Math.min(newMin, 8.0));
    setCurrentSliderEngineValues(prev => [newMin, Math.max(newMin, prev[1])]);
  };
  
  const handleMaxEngineInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newMax = parseFloat(e.target.value);
    if (isNaN(newMax)) newMax = 8.0;
    newMax = Math.min(8.0, Math.max(newMax, 1.0));
    setCurrentSliderEngineValues(prev => [Math.min(newMax, prev[0]), newMax]);
  };

  const handleSliderValueChange = (newValues: number[]) => {
    setCurrentSliderEngineValues(newValues as [number, number]);
  };

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

  // Handler to navigate to Profile Settings
  const handleViewProfileSettings = () => {
    setShowProfileSettings(true);
    setShowDashboard(false); // Hide dashboard
    setShowUploadVehicle(false); // Hide upload page
    setIsSearchPage(false); // Ensure search page is not visible
  };

  // Handler to navigate back from Profile Settings to Dashboard
  const handleBackFromProfileSettings = () => {
    setShowProfileSettings(false);
    setShowDashboard(true); // Show dashboard again
  };

  // Handler to navigate to Upload Vehicle page
  const handleViewUploadVehicle = () => {
    setSelectedVehicle(null); // Always clear selectedVehicle first
    if (!user) {
      setLoginContext('sell');
      setShowLogin(true);
      setShowUploadVehicle(false);
      setShowDashboard(false);
      setShowProfileSettings(false);
      setIsSearchPage(false);
    } else {
      setShowUploadVehicle(true);
      setShowDashboard(false);
      setShowProfileSettings(false);
      setIsSearchPage(false);
    }
  };

  // Handler to navigate back from Upload Vehicle page to Dashboard
  const handleBackFromUploadVehicle = () => {
      setShowUploadVehicle(false);
      setShowDashboard(true); // Show dashboard again
  };

  // Handler for submitting vehicle data
  const handleVehicleSubmit = async (vehicleData: any) => {
      console.log("Vehicle data submitted:", vehicleData);
      // Simulate adding the new vehicle to the list
      const newVehicle: Vehicle = {
          ...vehicleData,
          id: `new-${Date.now()}`, // Generate a unique ID
          images: vehicleData.images || [], // Assign the array of uploaded images
          image: vehicleData.images && vehicleData.images.length > 0 ? vehicleData.images[0] : (vehicleData.image || "/placeholder.svg"), // Set the main image to the first uploaded image, or existing image, or placeholder
          // Ensure other required fields have default or are handled by validation
          sellerName: vehicleData.sellerName || "N/A",
          sellerEmail: vehicleData.sellerEmail || "N/A",
          sellerPhone: vehicleData.sellerPhone || "N/A",
          sellerAddress: vehicleData.sellerAddress || "N/A",
          // Ensure other required fields have default or are handled by validation
          make: vehicleData.make || "Unknown Make",
          model: vehicleData.model || "Unknown Model",
          year: parseInt(vehicleData.year) || 0,
          price: vehicleData.price || "N/A",
          mileage: parseInt(vehicleData.mileage) || 0,
          transmission: vehicleData.transmission || "Unknown",
          fuel: vehicleData.fuel || "Unknown",
          engineCapacity: vehicleData.engineCapacity || "Unknown",
          province: vehicleData.province || "Unknown",
          city: vehicleData.city || "Unknown",
          bodyType: vehicleData.bodyType || "Unknown",
          variant: vehicleData.variant || "",
      };

      // Update the state with the new vehicle
      setAllVehicles(prevVehicles => [newVehicle, ...prevVehicles]);
      // Add the new vehicle to the user's listed cars state
      setUserListedCars(prevListedCars => [newVehicle, ...prevListedCars]);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      alert("Vehicle listed successfully!");
      handleBackFromUploadVehicle(); // Navigate back to dashboard
  };

  // Handler to save profile settings (updates local state)
  const handleSaveProfileSettings = async (updatedData: Partial<UserProfile>) => {
      // Simulate API call delay if needed, or just update state directly
      // await api.updateUserProfile(updatedData); // TODO: Implement actual API call
      setUser((prevUser: UserState) => { // Explicitly type prevUser
          if (!prevUser) return null;
          const newUser = { ...prevUser, ...updatedData };
          console.log("User state updated in CarMarketplace (from ProfileSettings):", newUser);
          // TODO: Persist these changes to your backend/localStorage here
          return newUser;
      });
      // Optionally show a success message or navigate back
      // handleBackFromProfileSettings(); // Navigate back after save
  };


  // When a user logs in, save their details including login method.
  const handleLoginSuccess = (userData: UserProfile) => {
    setUser(userData);
    setShowLogin(false);
    setShowDashboard(true);
    setIsSearchPage(false);
  }

  // Function to update user state from Dashboard/ProfileSettings
  const handleUserUpdate = (updatedData: Partial<UserProfile>) => {
    setUser((prevUser: UserState) => { // Explicitly type prevUser
      if (!prevUser) return null; // Should not happen if called from Dashboard
      const newUser = { ...prevUser, ...updatedData };
      console.log("User state updated in CarMarketplace:", newUser);
      // TODO: Persist these changes to your backend/localStorage here
      // Example: localStorage.setItem('userProfile', JSON.stringify(newUser));
      // Example: await api.updateUserProfile(newUser);
      return newUser;
    });
  }

  // Only call setUser(null) in ProfileSettings, not here
  const handleSignOut = () => {
    setShowDashboard(false);
    setIsSearchPage(true);
  }

  // Add the handleSaveCar function to manage saved cars and pass it to the Dashboard component.
  const handleSaveCar = (vehicle: Vehicle) => {
    setSavedCars((prevSavedCars) => {
      const alreadySaved = prevSavedCars.some((car) => car.id === vehicle.id);
      if (alreadySaved) {
        return prevSavedCars.filter((car) => car.id !== vehicle.id);
      } else {
        return [...prevSavedCars, vehicle];
      }
    });
  };

  // Handler to delete a listed car
  const handleDeleteListedCar = (vehicleToDelete: Vehicle) => {
    // Optional: Add a confirmation dialog
    // if (!window.confirm(`Are you sure you want to delete "${vehicleToDelete.make} ${vehicleToDelete.model}"? This action cannot be undone.`)) {
    //   return;
    // }

    setAllVehicles(prevVehicles => prevVehicles.filter(v => v.id !== vehicleToDelete.id));
    setUserListedCars(prevListedCars => prevListedCars.filter(v => v.id !== vehicleToDelete.id));
    // Optionally, show a success message
    // alert(`"${vehicleToDelete.make} ${vehicleToDelete.model}" has been deleted.`);
  };

  // Placeholder handler to edit a listed car
  const handleEditListedCar = (vehicleToEdit: Vehicle) => {
    console.log("Attempting to edit vehicle:", vehicleToEdit);
    setVehicleToEdit(vehicleToEdit);
    // Ensure other views are hidden
    setShowDashboard(false);
    setSelectedVehicle(null);
    setIsSearchPage(false);
    setShowLogin(false);
    setShowProfileSettings(false);
    setShowUploadVehicle(false);
  };

  // Handler to cancel editing
  const handleCancelEdit = () => {
    setVehicleToEdit(null);
    setShowDashboard(true); // Go back to dashboard, or to the previous view
  };

  // Handler to update vehicle details after editing
  const handleUpdateVehicle = (updatedVehicle: Vehicle) => {
    setAllVehicles(prevVehicles =>
      prevVehicles.map(v => (v.id === updatedVehicle.id ? updatedVehicle : v))
    );
    setUserListedCars(prevListedCars =>
      prevListedCars.map(v => (v.id === updatedVehicle.id ? updatedVehicle : v))
    );
    setVehicleToEdit(null);
    setShowDashboard(true); // Go back to dashboard
    alert(`"${updatedVehicle.make} ${updatedVehicle.model}" has been updated successfully!`);
  };

  // --- Routing Logic ---
  if (selectedProvince) {
    return (
      <>
        {/* Pass user state to Header */}
        <Header
          user={user}
          onLoginClick={() => { setSelectedVehicle(null); setShowLogin(true); }}
          onDashboardClick={() => user ? setShowDashboard(true) : setShowLogin(true)}
          onGoHome={() => { setIsSearchPage(true); setSelectedVehicle(null); }}
          onShowAllCars={() => { setFilteredVehicles(allVehicles); setIsSearchPage(false); setSelectedVehicle(null); }}
          onGoToSellPage={() => { setSelectedVehicle(null); handleViewUploadVehicle(); }}
          onSignOut={handleSignOut}
        />
        <div className="pt-16 md:pt-20">
          {/* Pass province string directly */}
          <LocationPage
            province={selectedProvince}
            vehicles={allVehicles} // Use allVehicles here
            onBack={() => setSelectedProvince(null)}
            user={user}
            // Pass Header navigation props
            onLoginClick={() => setShowLogin(true)}
            onDashboardClick={() => { setSelectedProvince(null); user ? setShowDashboard(true) : setShowLogin(true); }}
            onGoHome={() => setIsSearchPage(true)}
            onShowAllCars={() => { setFilteredVehicles(allVehicles); setIsSearchPage(false); }} // Use allVehicles here
            onGoToSellPage={handleViewUploadVehicle} // Pass the central handler
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
          onLoginClick={() => { setSelectedVehicle(null); setShowLogin(true); }}
          onDashboardClick={() => { setSelectedVehicle(null); user ? setShowDashboard(true) : setShowLogin(true); }}
          onGoHome={() => {
            setIsSearchPage(true);
            setSelectedVehicle(null); // Clear selected vehicle
          }}
          onShowAllCars={() => {
            setFilteredVehicles(allVehicles);
            setIsSearchPage(false);
            setSelectedVehicle(null); // Clear selected vehicle
          }}
          onGoToSellPage={() => { setSelectedVehicle(null); handleViewUploadVehicle(); }}
          onSignOut={handleSignOut}
        />
        <div className="pt-16 md:pt-20">
          <VehicleDetails
            vehicle={selectedVehicle}
            onBack={() => setSelectedVehicle(null)}
            user={user}
            savedCars={savedCars} // Pass the current list of saved cars
            onSaveCar={handleSaveCar} // Pass the handler to update saved cars
          />
        </div>
      </>
    )
  }

  // If a vehicle is being edited, show VehicleDetails in edit mode
  if (vehicleToEdit && user) {
    return (
      <>
        <Header
          user={user}
          onLoginClick={() => setShowLogin(true)}
          onDashboardClick={() => { setVehicleToEdit(null); setSelectedVehicle(null); user ? setShowDashboard(true) : setShowLogin(true); }}
          onGoHome={() => {
            setVehicleToEdit(null);
            setIsSearchPage(true);
            setSelectedVehicle(null); // Clear selected vehicle
          }}
          onShowAllCars={() => {
            setVehicleToEdit(null);
            setFilteredVehicles(allVehicles);
            setIsSearchPage(false);
            setSelectedVehicle(null); // Clear selected vehicle
          }}
          onGoToSellPage={() => { setVehicleToEdit(null); setSelectedVehicle(null); handleViewUploadVehicle(); }}
          onSignOut={handleSignOut}
        />
        <div className="pt-16 md:pt-20">
          <VehicleDetails
            vehicle={vehicleToEdit}
            onBack={handleCancelEdit} // This will be the "Cancel" button
            user={user}
            isEditMode={true}
            onUpdateVehicle={handleUpdateVehicle}
            savedCars={savedCars} // Pass savedCars for consistency, though not primary for editing
            onSaveCar={handleSaveCar} // Pass onSaveCar for consistency
          />
        </div>
      </>
    );
  }

  if (showLogin) {
    // Pass the updated handleLoginSuccess and Header navigation props
    return (
      <LoginPage
        onLoginSuccess={(userData) => {
          setUser(userData);
          setShowLogin(false);
          if (loginContext === 'sell') {
            setShowUploadVehicle(true);
            setShowDashboard(false);
            setShowProfileSettings(false);
            setIsSearchPage(false);
            setLoginContext('default');
          }
        }}
        onCancel={() => setShowLogin(false)}
        loginContext={loginContext}
        onDashboardClick={() => user ? setShowDashboard(true) : setShowLogin(true)}
        onGoHome={() => setIsSearchPage(true)}
        onShowAllCars={() => { setFilteredVehicles(allVehicles); setIsSearchPage(false); }}
        onGoToSellPage={handleViewUploadVehicle}
        onSignOut={handleSignOut}
      />
    );
  }

  if (showProfileSettings && user) {
      return (
          <ProfileSettings
              user={user} // Pass the full user object
              onBack={handleBackFromProfileSettings} // Pass handler to go back to dashboard
              onSave={handleSaveProfileSettings} // Pass handler to save profile changes
              onSignOut={handleSignOut} // Pass the sign out handler
          />
      );
  }

  // Render UploadVehicle page if showUploadVehicle is true and user is logged in
  if (showUploadVehicle && user) {
      return (
          <UploadVehicle
              user={user} // Pass the full user object
              onBack={handleBackFromUploadVehicle} // Pass handler to go back to dashboard
              onVehicleSubmit={handleVehicleSubmit} // Pass the submit handler
              onSaveProfile={handleSaveProfileSettings} // Pass handler to save profile changes
              onSignOut={handleSignOut} // Pass the main sign-out handler
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
          onViewProfileSettings={handleViewProfileSettings} // Pass the new handler
          onViewUploadVehicle={handleViewUploadVehicle} // Pass the new handler for vehicle upload
          listedCars={userListedCars} // Pass the user's listed cars to the dashboard
          savedCars={savedCars}
          onViewDetails={setSelectedVehicle}
          onEditListedCar={handleEditListedCar} // Pass the edit handler
          onDeleteListedCar={handleDeleteListedCar} // Pass the delete handler
          onSaveCar={handleSaveCar} // Ensure this prop is passed correctly
          // Pass Header navigation props
          onLoginClick={() => setShowLogin(true)} // Show login page
          onGoHome={() => { setShowDashboard(false); setIsSearchPage(true); setSelectedVehicle(null); }} // Go to search form, hide dashboard
          onShowAllCars={() => { setShowDashboard(false); setFilteredVehicles(allVehicles); setIsSearchPage(false); setSelectedVehicle(null); }} // Show all results, hide dashboard
          onGoToSellPage={handleViewUploadVehicle} // Pass the central handler
          onNavigateToUpload={handleViewUploadVehicle} // Pass the handler to navigate to upload vehicle page
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
        onShowAllCars={() => { setFilteredVehicles(allVehicles); setIsSearchPage(false); }} // Use allVehicles here
        onGoToSellPage={handleViewUploadVehicle}
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
                    <div className="relative flex flex-col" ref={engineCapacityRef}>
                      <label className="mb-1 font-medium text-sm text-[#6F7F69] dark:text-gray-300">Engine Capacity</label>
                      <button
                        onClick={() => {
                          setCurrentSliderEngineValues(engineCapacityRange);
                          setShowEngineCapacitySlider(!showEngineCapacitySlider);
                        }}
                        className="w-full px-4 py-3 rounded-lg border border-[#9FA791] dark:border-[#4A4D45] focus:outline-none focus:border-[#FF6700] dark:focus:border-[#FF7D33] text-left flex justify-between items-center bg-white dark:bg-[#2A352A] text-[#3E5641] dark:text-white"
                        aria-haspopup="true"
                        aria-expanded={showEngineCapacitySlider}
                      >
                        {formatEngineCapacityDisplay(engineCapacityRange)}
                        <ChevronDown className={`w-4 h-4 transition-transform ${showEngineCapacitySlider ? 'rotate-180' : ''}`} />
                      </button>

                      {showEngineCapacitySlider && (
                        <div className="absolute z-30 mt-1 w-full md:w-[320px] bg-white dark:bg-[#1F2B20] border border-[#9FA791] dark:border-[#4A4D45] rounded-lg shadow-xl p-5 top-full right-0 md:left-0 md:right-auto">
                          <div className="mb-4 text-center">
                            <span className="font-bold text-xl text-[#3E5641] dark:text-white">{currentSliderEngineValues[0].toFixed(1)}L</span>
                            <span className="text-xl text-[#6F7F69] dark:text-gray-400"> - </span>
                            <span className="font-bold text-xl text-[#3E5641] dark:text-white">{currentSliderEngineValues[1].toFixed(1)}L</span>
                          </div>

                          <SliderPrimitive.Root
                            value={currentSliderEngineValues}
                            onValueChange={handleSliderValueChange}
                            min={1.0}
                            max={8.0}
                            step={0.1}
                            minStepsBetweenThumbs={0}
                            className="relative flex w-full touch-none select-none items-center h-10"
                          >
                            <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-[#9FA791]/40 dark:bg-[#4A4D45]/60">
                              <SliderPrimitive.Range className="absolute h-full bg-[#FF6700] dark:bg-[#FF7D33]" />
                            </SliderPrimitive.Track>
                            {[0, 1].map(thumbIndex => (
                              <SliderPrimitive.Thumb
                                key={thumbIndex}
                                aria-label={thumbIndex === 0 ? "Minimum engine capacity" : "Maximum engine capacity"}
                                className="block h-6 w-6 rounded-full border-2 border-[#FF6700] dark:border-[#FF7D33] bg-white ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6700]/50 dark:focus-visible:ring-[#FF7D33]/50 focus-visible:ring-offset-2 cursor-grab active:cursor-grabbing"
                              />
                            ))}
                          </SliderPrimitive.Root>

                          <div className="mt-5 flex gap-4">
                            <input id="min-engine-input" type="number" value={currentSliderEngineValues[0].toFixed(1)} onChange={handleMinEngineInputChange} min="1.0" max="8.0" step="0.1" className="w-full px-3 py-2 rounded-md border border-[#9FA791] dark:border-[#4A4D45] bg-white dark:bg-[#2A352A] text-[#3E5641] dark:text-white text-sm focus:outline-none focus:border-[#FF6700] dark:focus:border-[#FF7D33]" placeholder="Min L" />
                            <input id="max-engine-input" type="number" value={currentSliderEngineValues[1].toFixed(1)} onChange={handleMaxEngineInputChange} min="1.0" max="8.0" step="0.1" className="w-full px-3 py-2 rounded-md border border-[#9FA791] dark:border-[#4A4D45] bg-white dark:bg-[#2A352A] text-[#3E5641] dark:text-white text-sm focus:outline-none focus:border-[#FF6700] dark:focus:border-[#FF7D33]" placeholder="Max L" />
                          </div>

                          <button onClick={handleApplyEngineCapacity} className="mt-5 w-full bg-[#FF6700] text-white dark:bg-[#FF7D33] px-4 py-2.5 rounded-lg hover:bg-[#FF6700]/90 dark:hover:bg-[#FF7D33]/90 transition-colors font-medium text-sm">
                            Apply Range
                          </button>
                        </div>
                      )}
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
                {allVehicles.slice(0, 6).map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className="bg-white dark:bg-[#2A352A] border border-[#9FA791]/20 dark:border-[#4A4D45]/20 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer flex flex-col overflow-hidden group"
                    onClick={() => setSelectedVehicle(vehicle)}
                  >
                    <div className="relative h-48 w-full overflow-hidden">
                       <img
                          src={(vehicle.images && vehicle.images.length > 0 ? vehicle.images[0] : vehicle.image) || "/placeholder.svg"}
                          alt={`${vehicle.make} ${vehicle.model} ${vehicle.variant || ''}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                       />
                    </div>
                    <div className="p-4 flex flex-col flex-grow">
                      <h3 className="text-lg font-semibold mb-2 text-[#3E5641] dark:text-white">
                        {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.variant || ''}
                      </h3>
                      <p className="text-[#FF6700] dark:text-[#FF7D33] font-bold text-lg mb-3">{formatPriceForDisplay(vehicle.price)}</p>
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
                      setFilteredVehicles(allVehicles); // Show all vehicles
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
                    <li>
                      <a
                        href="components/upload-vehicle.tsx"
                        className="text-sm text-gray-300 hover:text-[#FF7D33]"
                        onClick={(e) => {
                          e.preventDefault();
                          // Use the same handler as the main "Sell a Car" button
                          if (typeof window !== 'undefined') {
                            const sellBtn = document.querySelector('[data-sell-car-btn]');
                            if (sellBtn) (sellBtn as HTMLElement).click();
                          }
                        }}
                      >
                        Sell a Car
                      </a>
                    </li>
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
                    <li><a href="#" className="text-sm text-[#FF7D33]">Contact Us</a></li>
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
                          src={(vehicle.images && vehicle.images.length > 0 ? vehicle.images[0] : vehicle.image) || "/placeholder.svg"}
                          alt={`${vehicle.make} ${vehicle.model}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                       />
                     </div>
                     <div className="p-4 flex flex-col flex-grow">
                       <h3 className="text-lg font-semibold mb-2 text-[#3E5641] dark:text-white">
                         {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.variant || ''}
                       </h3>
                       <p className="text-[#FF6700] dark:text-[#FF7D33] font-bold text-lg mb-3">{formatPriceForDisplay(vehicle.price)}</p>
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

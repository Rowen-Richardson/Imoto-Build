"use client"

import { useState, useEffect } from "react"
import Image from "next/image" // Import Image for profile picture
import Link from "next/link"
import { Search, User, Menu, X } from "lucide-react" // Added Menu and X icons
import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"

// Make sure this interface matches the UserProfile type in dashboard.tsx and car-marketplace.tsx
interface HeaderProps {
  user?: {
    id?: string // Added id for potential key usage if needed elsewhere
    email: string
    firstName?: string // Added firstName
    lastName?: string // Added lastName for completeness, though not used here
    profilePic?: string
    loginMethod?: "email" | "google" | "facebook" | "apple" // Added loginMethod
    // Add other user fields if needed by the avatar/display logic
  } | null
  onLoginClick?: () => void
  onDashboardClick?: () => void
  onGoHome?: () => void
  onShowAllCars?: () => void
  onGoToSellPage?: () => void
  onSignOut?: () => void
  transparent?: boolean; // Added transparent prop
}

export function Header({
  user,
  onLoginClick,
  onDashboardClick,
  onGoHome,
  onShowAllCars,
  onGoToSellPage,
  onSignOut,
}: HeaderProps) {
  const isMobile = useMobile()
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close mobile menu if screen size changes to desktop
  useEffect(() => {
    if (!isMobile && mobileMenuOpen) {
      setMobileMenuOpen(false)
    }
  }, [isMobile, mobileMenuOpen])

  // Debug: Log user prop to verify updates
  console.log('[Header] user:', user);
  return (
    <header
      className={cn(
        "fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-full px-4 sm:px-6 py-2 max-w-6xl w-[95%] flex items-center justify-between transition-colors duration-300",
        "bg-black text-white shadow-lg", // Always solid black background
        mobileMenuOpen
          ? "bg-black text-white rounded-b-none rounded-t-2xl top-0 w-full max-w-none translate-x-0 left-0" // Full width when mobile menu is open
          : "",
      )}
    >
      <div className="flex items-center">
        {/* Use button for home navigation via prop */}
        <button onClick={onGoHome} className="font-bold text-xl mr-4 sm:mr-8">
          imoto {/* Changed name to match other components */}
        </button>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center justify-center flex-1 px-4 space-x-6">
        {" "}
        {/* Centered items */}
        {/* Use buttons for actions */}
        <button
          onClick={onShowAllCars}
          className="hover:text-[#FF6700] transition-colors text-sm font-medium"
          aria-label="Buy a Car"
        >
          {user ? "Buy My Dream" : "Buy a Car"}
        </button>
         <button onClick={onGoToSellPage} className="hover:text-[#FF6700] transition-colors text-sm font-medium">
          {user ? "Upload Vehicle" : "Sell a Car"}
        </button>
        {/* Keep Links for actual page navigation if needed */}
        <Link href="/Services" className="hover:text-[#FF6700] transition-colors text-sm font-medium">
          Services
        </Link>
        <Link href="/About" className="hover:text-[#FF6700] transition-colors text-sm font-medium">
          About
        </Link>
      </nav>

      {/* Right Side Actions */}
      <div className="flex items-center space-x-4">
        {/* User Menu */}
        {user ? (
          <button
            onClick={onDashboardClick}
            className="flex items-center space-x-2 hover:text-[#FF6700] transition-colors"
          >
            {user.profilePic ? (
              <Image
                src={user.profilePic || "/placeholder.svg"}
                alt="Profile"
                width={32}
                height={32}
                className="rounded-full object-cover" // Added object-cover
                unoptimized // Keep if using base64/external URLs not configured for optimization
                onError={(e) => {
                  // Optional: Handle image load error, e.g., show initials
                  console.warn("Failed to load profile image:", e.currentTarget.src)
                  // You could potentially set a state here to fallback to initials
                }}
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#FF6700] flex items-center justify-center text-white font-semibold">
                {/* Use first initial of first name if available, else email */}
                {(user.firstName || user.email).charAt(0).toUpperCase()}
              </div>
            )}
            {/* Display First Name if available, otherwise fallback to email prefix */}
            <span className="hidden md:inline-block text-sm font-medium">
              {user.firstName || user.email.split("@")[0]}
            </span>
          </button>
        ) : (
          <button
            onClick={onLoginClick}
            className="bg-[#FF6700] text-white px-4 py-2 rounded-full hover:bg-[#FF6700]/90 transition-colors text-sm font-medium flex items-center"
          >
            <User className="h-4 w-4 mr-2" />
            Login
          </button>
        )}

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2 rounded-full hover:bg-white/10 transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "md:hidden absolute top-full left-0 w-full bg-black overflow-hidden transition-all duration-300 ease-in-out shadow-lg rounded-b-2xl",
          mobileMenuOpen ? "max-h-[calc(100vh-60px)] opacity-100" : "max-h-0 opacity-0", // Adjust max-height as needed
        )}
      >
        {/* Mobile menu content goes here */}
        <div className="flex flex-col items-center py-6 space-y-5 px-4">
          <button
            onClick={() => {
              onShowAllCars?.();
              setMobileMenuOpen(false);
            }}
            className="text-white hover:text-[#FF6700] transition-colors text-lg font-medium"
            aria-label="Buy a Car"
          >
            {user ? "Buy My Dream" : "Buy a Car"}
          </button>
          <button
            onClick={() => {
              onGoToSellPage?.()
              setMobileMenuOpen(false)
            }}
            className="text-white hover:text-[#FF6700] transition-colors text-lg font-medium"
          >
            {user ? "Upload Vehicle" : "Sell a Car"}
          </button>
          <Link
            href="/Services"
            onClick={() => setMobileMenuOpen(false)}
            className="text-white hover:text-[#FF6700] transition-colors text-lg font-medium"
          >
            Services
          </Link>
          <Link
            href="/About"
            onClick={() => setMobileMenuOpen(false)}
            className="text-white hover:text-[#FF6700] transition-colors text-lg font-medium"
          >
            About
          </Link>
          {user ? (
            <>
              <button
                onClick={() => {
                  onDashboardClick?.()
                  setMobileMenuOpen(false)
                }}
                className="mt-4 text-white hover:text-[#FF6700] transition-colors text-lg font-medium"
              >
                My Dashboard
              </button>
              <button
                onClick={() => {
                  onSignOut?.()
                  setMobileMenuOpen(false)
                }}
                className="mt-2 text-sm text-gray-400 hover:text-red-500 transition-colors"
              >
                Sign Out
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                onLoginClick?.()
                setMobileMenuOpen(false)
              }}
              className="mt-4 bg-[#FF6700] text-white px-6 py-2 rounded-full hover:bg-[#FF6700]/90 transition-colors text-lg font-medium flex items-center"
            >
              <User className="h-5 w-5 mr-2" />
              Login
            </button>
          )}
        </div>
      </div>
    </header>
  )
}

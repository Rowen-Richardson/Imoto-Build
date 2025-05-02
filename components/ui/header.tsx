// components/ui/header.tsx
"use client"

import Link from "next/link" // Use Link for navigation if needed, but buttons are used for actions
import { Search, LogIn, UserCircle, LayoutDashboard, Car, PlusCircle, LogOut } from "lucide-react" // Added LogOut
import type { UserProfile } from "@/lib/data"
import { ThemeToggle } from "../theme-toggle"
import { Button } from "./button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Image from "next/image" // Import Image

interface HeaderProps {
  user: UserProfile | null
  onLoginClick: (context?: 'sell') => void // Context for login reason
  onDashboardClick: () => void
  onGoHome: () => void // Navigate to home/search page
  onShowAllCars: () => void // Navigate to show all cars view
  onGoToSellPage: () => void // Navigate to the sell car page
  onSignOut: () => void // Add sign out handler prop
  transparent?: boolean
}

export function Header({
  user,
  onLoginClick,
  onDashboardClick,
  onGoHome,
  onShowAllCars,
  onGoToSellPage,
  onSignOut, // Destructure the new prop
  transparent = false,
}: HeaderProps) {
  const headerClasses = `fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
    transparent
      ? "bg-transparent"
      : "bg-white dark:bg-[#1F2B20] shadow-md border-b border-[#9FA791]/20 dark:border-[#4A4D45]/20"
  }`

  const textClass = transparent ? "text-white" : "text-[#3E5641] dark:text-white"
  const hoverTextClass = transparent ? "hover:text-gray-200" : "hover:text-[#FF6700] dark:hover:text-[#FF7D33]"

  const getInitials = () => {
    if (!user) return ""
    // Prioritize first/last name, fallback to email
    const initials = (user.firstName?.[0] || "") + (user.lastName?.[0] || "")
    return initials || (user.email?.[0] || "").toUpperCase()
  }

  const handleSellClick = () => {
    if (user) {
      onGoToSellPage(); // Navigate to sell page if logged in
    } else {
      onLoginClick('sell'); // Show login modal with 'sell' context if logged out
    }
  }

  return (
    <header className={headerClasses}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <div
            onClick={onGoHome} // Use the prop to handle navigation
            className={`text-2xl font-bold cursor-pointer ${transparent ? 'text-white' : 'text-[#FF6700] dark:text-[#FF7D33]'}`}
            aria-label="Go to homepage" // Accessibility improvement
            role="button" // Semantics
            tabIndex={0} // Make it focusable
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onGoHome()} // Keyboard accessibility
          >
            imoto
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {user ? (
              // Logged-in navigation
              <>
                <button
                  onClick={onShowAllCars} // Use the prop
                  className={`text-sm font-medium ${textClass} ${hoverTextClass} transition-colors`}
                >
                  Buy A Car
                </button>
                <button
                  onClick={handleSellClick} // Use the handler
                  className={`text-sm font-medium ${textClass} ${hoverTextClass} transition-colors`}
                >
                  Sell My Car
                </button>
                <button
                  onClick={onDashboardClick} // Keep existing prop
                  className={`text-sm font-medium ${textClass} ${hoverTextClass} transition-colors`}
                >
                  Dashboard
                </button>
              </>
            ) : (
              // Logged-out navigation
              <>
                <button
                  onClick={onShowAllCars} // Allow browsing when logged out
                  className={`text-sm font-medium ${textClass} ${hoverTextClass} transition-colors`}
                >
                  Buy a Car
                </button>
                 <button
                  onClick={handleSellClick} // Use the handler
                  className={`text-sm font-medium ${textClass} ${hoverTextClass} transition-colors`}
                >
                  Sell a Car
                </button>
                {/* Placeholder links - replace href with actual paths or handlers */}
                <a href="#" className={`text-sm font-medium ${textClass} ${hoverTextClass} transition-colors`}>
                  Value My Car
                </a>
                <a href="#" className={`text-sm font-medium ${textClass} ${hoverTextClass} transition-colors`}>
                  Tools & Services
                </a>
              </>
            )}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className={`relative h-10 w-10 rounded-full ${transparent ? 'hover:bg-white/10' : 'hover:bg-black/10 dark:hover:bg-white/10'} focus-visible:ring-2 focus-visible:ring-offset-2 ${transparent ? 'focus-visible:ring-white/50 focus-visible:ring-offset-transparent' : 'focus-visible:ring-[#FF6700] focus-visible:ring-offset-white dark:focus-visible:ring-[#FF7D33] dark:focus-visible:ring-offset-[#1F2B20]'}`}
                    aria-label="User menu"
                  >
                    {user.profilePic ? (
                      <Image
                        src={user.profilePic}
                        alt="User profile"
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                        // Add error handling if needed
                        // onError={(e) => e.currentTarget.style.display = 'none'} // Example: hide on error
                      />
                    ) : (
                      // Fallback Initials Avatar
                      <div className={`w-full h-full rounded-full flex items-center justify-center ${transparent ? 'bg-white/20 text-white' : 'bg-gray-200 dark:bg-gray-700 text-[#3E5641] dark:text-white'} text-sm font-medium`}>
                        {getInitials()}
                      </div>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none truncate">
                        {user.firstName || user.lastName ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'User'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onDashboardClick} className="cursor-pointer">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                  {/* Add other relevant links like Settings */}
                  <DropdownMenuItem onClick={() => alert("Settings page not implemented")} className="cursor-pointer">
                     <UserCircle className="mr-2 h-4 w-4" />
                     <span>Profile Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onSignOut} className="cursor-pointer text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-900/30 focus:text-red-700 dark:focus:text-red-300">
                    <LogOut className="mr-2 h-4 w-4" /> {/* Changed icon */}
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              // Login Button
              <Button
                onClick={() => onLoginClick()} // Call without context for default login
                variant={transparent ? "outline" : "default"}
                className={
                  transparent
                    ? "border-white text-white hover:bg-white hover:text-[#3E5641]"
                    : "bg-[#FF6700] text-white hover:bg-[#FF6700]/90 dark:bg-[#FF7D33] dark:hover:bg-[#FF7D33]/90"
                }
              >
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

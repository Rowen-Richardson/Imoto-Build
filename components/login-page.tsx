"use client"

import type React from "react"

import { useState } from "react"
import { Search, Facebook } from "lucide-react"
import { Header } from "./ui/header" // Import the main Header component

import type { UserProfile } from "./dashboard"; // Import UserProfile type for Header props

interface LoginPageProps {
  onLoginSuccess: (userData: UserProfile) => void // Use UserProfile type
  onCancel: () => void
  loginContext?: 'sell' | 'default'
  next?: string | null
  // Add Header navigation props
  onDashboardClick: () => void;
  onGoHome: () => void;
  onShowAllCars: () => void;
  onGoToSellPage: () => void;
  onSignOut: () => void;
}

export default function LoginPage({ onLoginSuccess, onCancel, loginContext, next, onDashboardClick, onGoHome, onShowAllCars, onGoToSellPage, onSignOut }: LoginPageProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Login failed")
      }

      const { user, token } = await response.json()

      if (rememberMe) {
        localStorage.setItem("authToken", token)
      } else {
        sessionStorage.setItem("authToken", token)
      }

      // Assuming the user object from the API matches the expected structure for onLoginSuccess
      onLoginSuccess(user)
      if (next) {
        window.location.href = next;
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = (provider: string) => {
    // In a real app, this would authenticate with the provider
    // Simulate a successful social login
    const fakeUser = {
      email: `user@${provider.toLowerCase()}.com`,
      profilePic: "https://via.placeholder.com/40", // Placeholder image
    };
    onLoginSuccess(fakeUser as UserProfile);
    if (next) {
      window.location.href = next;
    } else {
      window.location.href = "/dashboard";
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[var(--dark-bg)]">
      {/* Use the main Header component */}
      <Header
        user={null} // User is not logged in on this page
        onLoginClick={() => setIsLogin(true)} // Clicking login in header should show login form
        onDashboardClick={onDashboardClick} // Use prop
        onGoHome={onGoHome} // Use prop
        onShowAllCars={onShowAllCars} // Use prop
        onGoToSellPage={onGoToSellPage} // Use prop
        onSignOut={onSignOut} // Use prop
        transparent={false} // Header is not transparent on this page
      />

      {/* Main Content */}
      <div className="flex flex-col md:flex-row min-h-[calc(100vh-80px)] pt-20">
        {/* Left Column */}
        <div className="w-full md:w-1/2 bg-white dark:bg-[#1F2B20] p-8 md:p-16 flex flex-col justify-center text-[#3E5641] dark:text-white">
          <div className="max-w-md mx-auto">
            <div className="mb-2 text-sm uppercase tracking-wider text-[#6F7F69] dark:text-gray-400">LARGEST CAR MARKETPLACE</div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              POWERED BY <br />
              CREATORS AROUND <br />
              THE WORLD.
              <span className="inline-flex ml-2">
                <span className="h-4 w-4 rounded-full bg-green-800"></span>
                <span className="h-4 w-4 rounded-full bg-green-600 -ml-1"></span>
                <span className="h-4 w-4 rounded-full bg-green-400 -ml-1"></span>
                <span className="h-4 w-4 rounded-full bg-green-300 -ml-1"></span>
              </span>
            </h1>

            <p className="text-[#6F7F69] dark:text-gray-300 mb-8">
              Over 3 million high-quality vehicles brought to you by the world's premier automotive dealers.
            </p>

            {isLogin ? (
              <div>
                <p className="text-[#6F7F69] dark:text-gray-300 mb-4">Don't have an account?</p>
                <button
                  onClick={() => setIsLogin(false)}
                  className="inline-flex items-center text-[#FF6700] dark:text-[#FF7D33] hover:text-[#FF6700]/80 dark:hover:text-[#FF7D33]/80 font-medium transition-colors"
                >
                  Create account <span className="ml-2">→</span>
                </button>
              </div>
            ) : (
              <div>
                <p className="text-[#6F7F69] dark:text-gray-300 mb-4">Already have an account?</p>
                <button
                  onClick={() => setIsLogin(true)}
                  className="inline-flex items-center text-[#FF6700] dark:text-[#FF7D33] hover:text-[#FF6700]/80 dark:hover:text-[#FF7D33]/80 font-medium transition-colors"
                >
                  Login here <span className="ml-2">→</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="w-full md:w-1/2 bg-gray-100 dark:bg-[#2A352A] p-8 md:p-16 flex items-center justify-center relative">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30"
            style={{
              backgroundImage: 'url("https://via.placeholder.com/1200x800?text=Luxury+Car")',
            }}
          />

          <div className="bg-white dark:bg-[#1F2B20] p-8 rounded-lg shadow-lg w-full max-w-md z-10 relative text-[#3E5641] dark:text-white">
            <h2 className="text-2xl font-bold mb-6 text-center">
              {isLogin ? (
                <>
                  {loginContext === 'sell' ? // Corrected access
                    "Login to list your car" :
                    "Login to your account"}
                </>
              ) : (
                "Create your account"
              )}
            </h2>

            {loginContext === 'sell' && ( // Corrected access
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-sm text-blue-800 dark:text-blue-300">
                Unlock our AI-powered selling tools: Get instant price recommendations
                and reach millions of buyers when you login.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {isLogin ? "Email or Username" : "Email Address"}
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-[#4A4D45] rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF6700] dark:focus:ring-[#FF7D33] focus:border-[#FF6700] dark:focus:border-[#FF7D33] bg-white dark:bg-[#2A352A] text-[#3E5641] dark:text-white placeholder-[#6F7F69] dark:placeholder-gray-400"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-[#4A4D45] rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF6700] dark:focus:ring-[#FF7D33] focus:border-[#FF6700] dark:focus:border-[#FF7D33] bg-white dark:bg-[#2A352A] text-[#3E5641] dark:text-white placeholder-[#6F7F69] dark:placeholder-gray-400"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                    className="h-4 w-4 text-[#FF6700] dark:text-[#FF7D33] focus:ring-[#FF6700] dark:focus:ring-[#FF7D33] border-gray-300 dark:border-[#4A4D45] rounded"
                  />
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Remember me</span>
                </label>

                {isLogin && (
                  <a href="#" className="text-sm text-[#FF6700] dark:text-[#FF7D33] hover:text-[#FF6700]/80 dark:hover:text-[#FF7D33]/80 transition-colors">
                    Forgot password?
                  </a>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-[#3E5641] text-white dark:bg-[#4A4D45] py-2 px-4 rounded-md hover:bg-[#3E5641]/90 dark:hover:bg-[#4A4D45]/90 transition-colors"
              >
                {isLogin ? "Login" : "Create Account"}
              </button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-[#4A4D45]"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-[#1F2B20] text-gray-500 dark:text-gray-400">Or continue with</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <button
                  onClick={() => handleSocialLogin("Facebook")}
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-[#4A4D45] rounded-md shadow-sm bg-white dark:bg-[#2A352A] text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1F2B20]"
                >
                  <Facebook className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </button>
                <button
                  onClick={() => handleSocialLogin("Google")}
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-[#4A4D45] rounded-md shadow-sm bg-white dark:bg-[#2A352A] text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1F2B20]"
                >
                  <svg
                    className="h-5 w-5 text-[#FF6700] dark:text-[#FF7D33]" // Updated color
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleSocialLogin("Apple")}
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-[#4A4D45] rounded-md shadow-sm bg-white dark:bg-[#2A352A] text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1F2B20]"
                >
                  <svg
                    className="h-5 w-5 text-gray-900 dark:text-gray-100" // Added dark mode text color
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M14.94,5.19A4.38,4.38,0,0,0,16,2,4.44,4.44,0,0,0,13,3.52,4.17,4.17,0,0,0,12,6.61,3.69,3.69,0,0,0,14.94,5.19Zm2.52,7.44a4.51,4.51,0,0,1,2.16-3.81,4.66,4.66,0,0,0-3.66-2c-1.56-.16-3,.91-3.83.91s-2-.89-3.3-.87A4.92,4.92,0,0,0,4.69,9.39C2.93,12.45,4.24,17,6,19.47,6.8,20.68,7.8,22.05,9.12,22s1.75-.82,3.28-.82,2,.82,3.3.79,2.22-1.24,3.06-2.45a11,11,0,0,0,1.38-2.85A4.41,4.41,0,0,1,17.46,12.63Z" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="mt-6 text-center">
              <button onClick={onCancel} className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
                Back to listings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
